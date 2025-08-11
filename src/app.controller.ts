import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getProjectInfo(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>NestJS Single Action Pattern Demo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .version {
            color: #7f8c8d;
            font-size: 1.1em;
            margin-bottom: 30px;
        }
        ul {
            margin: 10px 0;
        }
        li {
            margin: 5px 0;
        }
        .highlight {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 15px 0;
        }
        .getting-started {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #27ae60;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>NestJS Single Action Pattern Demo</h1>
    <div class="version">Version 0.0.1</div>

    <div class="highlight">
        <h2>Description</h2>
        <p>A practical example of the Single Action Controller pattern in NestJS — a lightweight architectural approach where each controller and service handles exactly one action.</p>
    </div>

    <h2>Architecture</h2>
    <p><strong>Pattern:</strong> Single Action Controller</p>
    <p><strong>Principle:</strong> Each controller and service handles exactly one action</p>
    
    <h3>Benefits:</h3>
    <ul>
        <li>Minimal dependencies</li>
        <li>Simple tests</li>
        <li>Effortless maintenance</li>
        <li>Clean, decoupled code</li>
        <li>Highly testable backend</li>
    </ul>

    <h2>Technology Stack</h2>
    <ul>
        <li><strong>Framework:</strong> NestJS v11.1.6</li>
        <li><strong>Language:</strong> TypeScript</li>
        <li><strong>Database:</strong> SQLite with TypeORM</li>
        <li><strong>Features:</strong> Auto-synchronization, Auto entity discovery, Lightweight setup</li>
        <li><strong>Testing:</strong> Jest with unit and e2e tests</li>
        <li><strong>Linting:</strong> ESLint with TypeScript support</li>
    </ul>

    <h2>Project Structure</h2>
    <ul>
        <li><strong>Pattern:</strong> Single Action Pattern</li>
        <li><strong>Organization:</strong> One action per controller/service</li>
        <li><strong>Database:</strong> Auto-sync with SQLite</li>
        <li><strong>Entities:</strong> Auto-discovered from <code>src/</code> directory</li>
    </ul>

    <h2>Author</h2>
    <p>Serhii Malyshev<br>
    <a href="https://medium.com/@s_malyshev" target="_blank">https://medium.com/@s_malyshev</a></p>

    <h2>License</h2>
    <p>MIT</p>

    <h2>Documentation</h2>
    <p>See <code>README.md</code> for detailed setup and usage instructions</p>

    <div class="getting-started">
        <h2>Getting Started</h2>
        <p><code>yarn install</code></p>
        <p><code>yarn start:dev</code></p>
        <p>Visit <a href="http://localhost:3000">http://localhost:3000</a></p>
        <p><em>The database file (<code>database.sqlite</code>) will be created automatically.</em></p>
    </div>
</body>
</html>
`;
  }
}
