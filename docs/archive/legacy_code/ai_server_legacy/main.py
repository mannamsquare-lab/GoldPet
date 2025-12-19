from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "GoldPet AI Server"}

@app.post("/api/v1/ai/pet-profile")
async def create_pet_profile():
    # This is a mock endpoint for now.
    # In a real scenario, it would receive data and start an AI generation task.
    return {"requestId": "mock-request-id-12345"}
