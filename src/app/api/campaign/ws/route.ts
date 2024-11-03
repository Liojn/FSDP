/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import dbConfig from 'dbConfig';
import { Collection } from 'mongodb';
import { Campaign, CampaignParticipant } from '../../../campaign/types';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';

const clients = new Set<WebSocket>();

async function broadcastUpdate() {
  try {
    const db = await dbConfig.connectToDatabase();
    const campaignsCollection: Collection<Campaign> = db.collection('campaigns');
    const participantsCollection: Collection<CampaignParticipant> = db.collection('campaign_participants');

    const campaign = await campaignsCollection.findOne({ status: 'Active' });
    if (!campaign) return;

    const participants = await participantsCollection
      .find({ campaignId: campaign._id?.toString() })
      .toArray();

    const totalProgress = participants.reduce((sum, p) => sum + p.currentProgress, 0);
    const updatedMilestones = campaign.milestones.map(milestone => {
      const milestoneTarget = (campaign.targetReduction * milestone.percentage) / 100;
      if (!milestone.reached && totalProgress >= milestoneTarget) {
        return { ...milestone, reached: true, reachedAt: new Date() };
      }
      return milestone;
    });

    if (JSON.stringify(campaign.milestones) !== JSON.stringify(updatedMilestones)) {
      await campaignsCollection.updateOne(
        { _id: campaign._id },
        {
          $set: {
            totalReduction: totalProgress,
            milestones: updatedMilestones,
          },
        }
      );
    }

    const update = JSON.stringify({
      totalReduction: totalProgress,
      milestones: updatedMilestones,
    });

    clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(update);
      }
    });
  } catch (error) {
    console.error('Error broadcasting update:', error);
  }
}

// Store clients and WebSocket server instance

let wss: WebSocketServer;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Initialize WebSocket server if it doesn't exist
    if (!wss) {
      // Access the underlying HTTP server
      const server = (res.socket as any).server;
      if (server && !server.wss) {
        wss = new WebSocketServer({ noServer: true });
        server.wss = wss; // Attach wss to server to prevent multiple instances

        // Handle WebSocket connection
        wss.on('connection', (socket: WebSocket) => {
          clients.add(socket);
          console.log('Client connected');

          const intervalId = setInterval(() => broadcastUpdate(), 5000);

          socket.on('close', () => {
            clearInterval(intervalId);
            clients.delete(socket);
            console.log('Client disconnected');
          });

          socket.on('error', () => {
            clearInterval(intervalId);
            clients.delete(socket);
            console.log('Client error');
          });
        });

        // Upgrade HTTP to WebSocket
        server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer<ArrayBufferLike>) => {
          if (request.url === '/api/campaign/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit('connection', ws, request);
            });
          } else {
            socket.destroy();
          }
        });
      }
    }
    res.status(200).end();
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
