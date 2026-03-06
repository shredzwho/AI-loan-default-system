import asyncio
import websockets
import json

async def test():
    async with websockets.connect('ws://localhost:8000/ws/analyze_borrower') as ws:
        await ws.send(json.dumps({"applicant_id": 10}))
        try:
            while True:
                msg = await ws.recv()
                print(msg)
        except Exception as e:
            print(f"Error: {e}")

asyncio.run(test())
