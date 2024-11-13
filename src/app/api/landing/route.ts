// app/api/landing/route.ts

export async function GET() {
    return new Response(JSON.stringify({ message: 'Welcome to EcoFarm!' }), {
        headers: { 'Content-Type': 'application/json' },
    });
}
