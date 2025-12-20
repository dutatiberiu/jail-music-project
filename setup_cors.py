#!/usr/bin/env python3
"""
Setup CORS policy on R2 bucket to allow GitHub Pages access
"""

import boto3
import json

# R2 Credentials (same as scan_r2.py)
ACCESS_KEY_ID = "7210830f39639a520ec5478743c5a603"
SECRET_ACCESS_KEY = "ae2a6fd16f26e3f822e2f4f2ae25edba990c10dafd96a6e45e50d399d2e3b3a5"
ACCOUNT_ID = "d7fae86cb5a116b744a34198f4f6f8f9"
BUCKET_NAME = "undercover-music"

# R2 Endpoint
ENDPOINT_URL = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"

def setup_cors():
    """Configure CORS policy on R2 bucket"""

    print("=" * 60)
    print("  R2 CORS CONFIGURATION")
    print("=" * 60)
    print(f"\n>> Connecting to R2 bucket: {BUCKET_NAME}\n")

    # Create S3 client
    s3_client = boto3.client(
        's3',
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY_ID,
        aws_secret_access_key=SECRET_ACCESS_KEY,
        region_name='auto'
    )

    # CORS configuration
    cors_configuration = {
        'CORSRules': [
            {
                'AllowedOrigins': [
                    'https://dutatiberiu.github.io',  # Your GitHub Pages domain
                    'http://localhost:*',             # For local testing
                    'http://127.0.0.1:*'              # For local testing
                ],
                'AllowedMethods': ['GET', 'HEAD'],
                'AllowedHeaders': ['*'],
                'ExposeHeaders': [
                    'Content-Length',
                    'Content-Type',
                    'Content-Range',
                    'Accept-Ranges'
                ],
                'MaxAgeSeconds': 3600
            }
        ]
    }

    try:
        # Apply CORS configuration
        print(">> Applying CORS policy...")
        s3_client.put_bucket_cors(
            Bucket=BUCKET_NAME,
            CORSConfiguration=cors_configuration
        )

        print("[OK] CORS policy applied successfully!\n")
        print("CORS Configuration:")
        print(json.dumps(cors_configuration, indent=2))
        print("\n" + "=" * 60)
        print("[✓] Done! Your music player should now work!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Refresh your browser (Ctrl+Shift+R)")
        print("2. Try playing a song")
        print("3. Check browser console (F12) for any errors\n")

    except Exception as e:
        print(f"[ERROR] Failed to apply CORS policy: {e}")
        return False

    return True

if __name__ == "__main__":
    setup_cors()
