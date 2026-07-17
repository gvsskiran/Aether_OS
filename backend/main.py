import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

app = FastAPI(title="Aether_OS Advanced Core")

# CORS Setup for seamless frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY)

class ConceptRequest(BaseModel):
    concept: str

@app.post("/generate")
async def generate_workspace(request: ConceptRequest):
    if not request.concept.strip():
        raise HTTPException(status_code=400, detail="Concept cannot be empty")
        
    system_prompt = (
        "You are Aether_OS, a premium next-gen generative workspace. Provide a strict JSON response for the user's concept. "
        "The response MUST contain exactly these four keys with no variations:\n"
        "1. 'Technical_Architecture': Comprehensive, highly technical architectural blueprint.\n"
        "2. 'Marketing_Strategy': Advanced growth loops, target personas, and GTM strategy.\n"
        "3. 'Financial_Model': In-depth breakdown of monetization, pricing tiers, and projections.\n"
        "4. 'Generative_Artifact': A COMPLETE, standalone, fully functional HTML page with integrated modern CSS and JavaScript inside <style> and <script> tags. It must be an interactive dashboard, utility tool, calculations interface, or arcade-style game related to the concept. Make it beautiful, modern, and dark-themed if applicable.\n\n"
        "Return ONLY raw valid JSON. Do not include markdown code blocks like ```json."
    )

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Execute advanced generation matrix for: {request.concept}"}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        raw_content = completion.choices[0].message.content
        return json.loads(raw_content)
        
    except Exception as e:
        print(f"❌ GROQ CORE EXCEPTION: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)