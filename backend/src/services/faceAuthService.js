const { spawn } = require('child_process');
const path = require('path');

const PYTHON_SCRIPT_PATH = path.join(__dirname, '../../scripts/face_auth.py');

/**
 * Generate face embedding from image file
 * @param {string} imagePath 
 * @returns {Promise<number[]>}
 */
const generateEmbedding = (imagePath) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [PYTHON_SCRIPT_PATH, 'generate', imagePath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorString}`));
                return;
            }
            try {
                const embedding = JSON.parse(dataString);
                resolve(embedding);
            } catch (error) {
                reject(new Error(`Failed to parse python output: ${error.message}`));
            }
        });
    });
};

/**
 * Verify face against stored embedding
 * @param {string} imagePath 
 * @param {number[]} targetEmbedding 
 * @returns {Promise<boolean>}
 */
const verifyFace = (imagePath, targetEmbedding) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            PYTHON_SCRIPT_PATH,
            'verify',
            imagePath,
            JSON.stringify(targetEmbedding)
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorString}`));
                return;
            }
            try {
                const isVerified = JSON.parse(dataString);
                resolve(isVerified);
            } catch (error) {
                reject(new Error(`Failed to parse python output: ${error.message}`));
            }
        });
    });
};

module.exports = {
    generateEmbedding,
    verifyFace,
};
