import express from 'express';
import axios from "axios";


const app = express()
app.use(express.json())
const PORT = 3434;

async function handler(event, call_endpoint) {
    const payload = {
        name: event.data.user.id,
        publishData: {
            bucket: event.data.deployedBucket,
            folder: event.data.deployPath,
        },
        publishedLocation: event.data.deployPath
    }
    await axios({
        url: call_endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            payload
        }
    });
}

app.post('/', async (req, res) => {
    const {body} = req;
    try {
        if (body.type === "publish_completed") {

            if (!process.env.CALL_ENDPOINT) {
                console.error('Bad Request! CALL_ENDPOINT variable not set');
                return res.status(400).json({
                    error: 'Bad Request! CALL_ENDPOINT variable not set'
                });
            }

            await handler(body, process.env.CALL_ENDPOINT);
        }
        return res.json({
            status: "OK"
        })
    } catch (e) {
        return res.status(500).json({
            error: e.toString()
        });
    }
});

console.log(`publish notifyer listen on port ${PORT}`);
app.listen(PORT)