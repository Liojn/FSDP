export function generateHTMLReport(content: string, generatedDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Sustainability Report</title>
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
        </style>
      </head>
      <body>
        <header>
          <h1>Sustainability Report</h1>
          <p>Generated on: ${generatedDate}</p>
        </header>

        <div class="content">
          ${content}
        </div>

        <footer>
          Page <span class="pageNumber"></span>
        </footer>
      </body>
    </html>
  `;
}
