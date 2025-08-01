import 'dotenv/config'
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

const extractText = (resp) => {
    try {
        const text =
        resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
        resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
        resp?.response?.candidates?.[0]?.content?.text;

        return text ?? JSON.stringify(resp, null, 2);
    } catch (err) {
        console.error("Error extracting text:", err);
        return JSON.stringify(resp, null, 2);
    }
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//declare var for express
const app = express();
//declare var for multer
const upload = multer();
//declare var for google gen ai model
const def_gemini_ai = 'gemini-2.5-flash';
const def_port = 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY,
});

//call middleware to receipt header with Content-Type : application/json
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-text', async (req, res) => {

    try{
        //const { prompt } = req.body;

        console.log(req.body);
        
        const prompt = req.body?.prompt;

        if(!prompt){
            res.status(400).json({message: "belum ada prompt yg diisi" });
            return;
        }

        const resp = await ai.models.generateContent({
            model: def_gemini_ai,
            contents: prompt,
        });

        res.json({result: extractText(resp)});
    }catch(err){
        res.status(500).json({message: err.message});
    }

});

app.post('/generate-text-from-image', upload.single('image'), async (req, res) => {

    try{

        console.log(req.body);
        
        const prompt = req.body?.prompt;

        if(!prompt){
            res.status(400).json({message: "belum ada prompt yg diisi" });
            return;
        }

        const file = req.file;

        if(!file){
            res.status(400).json({message: "file 'image' blm diupload!" });
            return;
        }

        const imageBase64 = file.buffer.toString('base64');

        const resp = await ai.models.generateContent({
            model: def_gemini_ai,
            contents: [
                {text: prompt},
                {inlineData: {mimeType: file.mimetype, data: imageBase64}}
            ],
        });

        res.json({result: extractText(resp)});
    }catch(err){
        res.status(500).json({message: err.message});
    }

});

app.post('/chat', async (req, res) => {
    try{
        if(!req.body){
            return res.json(400,'Invalid request body!');
        }

        const {messages} = req.body;
        if(!messages){
            return res.json(400,'Pesannya masih kosong!');
        }

        const payload = messages.map(
            msg=>({
                role:msg.role,
                parts:[{text: msg.content}]
            })
        );

        console.log(payload);

        const resp = await ai.models.generateContent({
            model: def_gemini_ai,
            contents: payload
        });

        res.json({result: extractText(resp)});
    }catch(err){
        res.status(500).json({message: err.message});
    }
})


app.listen(def_port, () => {
    console.log("this is server");
    console.log("open here : http://localhost:" + def_port);
});
