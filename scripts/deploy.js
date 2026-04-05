const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function deploy() {
    const rootDir = path.join(__dirname, '..');
    const envPath = path.join(rootDir, 'cypress.env.json');
    const resultsPath = path.join(rootDir, 'cypress', 'results.json');
    const outputPath = path.join(rootDir, 'docker-compose.generated.yml');

    if (!fs.existsSync(envPath)) {
        console.error('Error: cypress.env.json not found');
        process.exit(1);
    }

    if (!fs.existsSync(resultsPath)) {
        console.error('Error: cypress/results.json not found. Run tests first.');
        process.exit(1);
    }

    const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

    const { SSH_HOST, SSH_USER, REMOTE_PATH, COMPOSE_TEMPLATE } = env;
    const { baseUrl, tokens } = results;

    if (!SSH_HOST || !SSH_USER || !REMOTE_PATH || !COMPOSE_TEMPLATE) {
        console.error('Error: Missing required SSH or template info in cypress.env.json');
        process.exit(1);
    }

    // Replace placeholders in template
    // SUB_URL_TEMPLATE=... -> SUB_URL_TEMPLATE=${baseUrl}{token}
    // SUBS=... -> SUBS=${tokens.join(',')}
    
    let yaml = COMPOSE_TEMPLATE;
    yaml = yaml.replace(/SUB_URL_TEMPLATE=.*/g, `SUB_URL_TEMPLATE=${baseUrl}{token}`);
    yaml = yaml.replace(/SUBS=.*/g, `SUBS=${tokens.join(',')}`);

    fs.writeFileSync(outputPath, yaml);
    console.log('Generated docker-compose.generated.yml');

    const remoteFullFile = path.join(REMOTE_PATH, 'docker-compose.yml');

    try {
        console.log(`Uploading to ${SSH_USER}@${SSH_HOST}:${remoteFullFile}...`);
        execSync(`scp ${outputPath} ${SSH_USER}@${SSH_HOST}:${remoteFullFile}`, { stdio: 'inherit' });

        console.log('Restarting service via SSH...');
        const sshCmd = `ssh ${SSH_USER}@${SSH_HOST} "cd ${REMOTE_PATH} && docker compose up -d"`;
        execSync(sshCmd, { stdio: 'inherit' });

        console.log('Deployment successful!');
    } catch (error) {
        console.error('Deployment failed:', error.message);
        process.exit(1);
    }
}

deploy();
