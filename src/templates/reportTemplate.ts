export function generateHTMLReport(
  content: string,
  generatedDate: string,
  scopeEmissions: { scope1: number; scope2: number; scope3: number }, 
  netZeroImage: string,
  emissionsChartImage: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Sustainability Report</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
          }
          header {
            text-align: center;
            margin-bottom: 50px;
          }
          header h1 {
            font-size: 36px;
            margin-bottom: 10px;
          }
          header p {
            font-size: 14px;
            color: #555;
          }
          footer {
            position: fixed;
            bottom: 20px;
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
          .content {
            font-size: 14px;
            line-height: 1.6;
          }
          h1 {
            font-size: 28px;
            margin-top: 40px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
          }
          h2 {
            font-size: 24px;
            margin-top: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          h3 {
            font-size: 20px;
            margin-top: 20px;
          }
          ul, ol {
            margin-left: 20px;
          }
          p {
            margin-bottom: 15px;
          }
          .page-number:after {
            content: counter(page);
          }
          .chart-container {
            width: 400px;
            height: 400px;
            margin: 20px auto;
          }
          .shared-container {
            text-align: center;
            margin: 40px 0;
          }
          .shared-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Sustainability Report</h1>
          <p>Generated on: ${generatedDate}</p>
        </header>

        <div class="content">
          ${content}

          <h2>Scope Pie Chart</h2>
          <div class="chart-container">
            <canvas id="emissionPieChart"></canvas>
          </div>

          <h2>Net Zero Graph Timeline</h2>
          <div class="shared-container">
            <img src="${netZeroImage}" alt="Net Zero Graph Timeline" />
          </div>

          <h2>Carbon Neutral Emissions Breakdown</h2>
          <div class="shared-container">
            <img src="${emissionsChartImage}" alt="Carbon Neutral Emissions Breakdown" />
          </div>
        </div>

        <footer>
          Page <span class="pageNumber"></span>
        </footer>

        <script>
          document.addEventListener("DOMContentLoaded", () => {
            const ctx = document.getElementById('emissionPieChart').getContext('2d');
            new Chart(ctx, {
              type: 'pie',
              data: {
                labels: [\`Scope 1: ${scopeEmissions.scope1}\` + ' CO2e',
                  \`Scope 2: ${scopeEmissions.scope2}\`  + ' CO2e',
                  \`Scope 3: ${scopeEmissions.scope3}\`  + ' CO2e'],
                datasets: [{
                  data: [${scopeEmissions.scope1}, ${scopeEmissions.scope2}, ${scopeEmissions.scope3}],
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                  hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                }],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        return \`\${context.label}: \${value}\`;
                      },
                    },
                  },
                },
              },
            });
          });
        </script>
      </body>
    </html>
  `;
}
