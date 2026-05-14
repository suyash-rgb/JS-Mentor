
import jwt as pyjwt
from jwt import PyJWKClient
import os

CLERK_JWKS_URL = "https://on-bird-73.clerk.accounts.dev/.well-known/jwks.json"
jwks_client = PyJWKClient(CLERK_JWKS_URL)

def test_clerk_auth(token):
    try:
        # Verify the Clerk token using Clerk's public keys
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        print(f"Signing key fetched: {type(signing_key)}")
        
        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        print("Decoded payload successfully")
        return payload
    except Exception as e:
        print(f"Clerk Verification Error: {e}")
        return None

if __name__ == "__main__":
    test_clerk_auth("header.payload.signature")
