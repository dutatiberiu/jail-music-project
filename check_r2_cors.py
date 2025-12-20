#!/usr/bin/env python3
"""
Check what CORS headers R2 returns
"""

import requests

test_url = "https://pub-2c614bd24cca4ed6948f5bf497b0cfe1.r2.dev/Tiberiu/Ed%20Sheeran/Ed%20Sheeran%20%20-%20%2B%20(Plus)/01%20The%20A%20Team.mp3"

print("Testing CORS headers from R2...")
print(f"URL: {test_url}\n")

try:
    # Make HEAD request to check headers without downloading the file
    response = requests.head(
        test_url,
        headers={
            'Origin': 'https://dutatiberiu.github.io',
            'Access-Control-Request-Method': 'GET'
        }
    )

    print(f"Status Code: {response.status_code}")
    print("\nResponse Headers:")
    print("-" * 60)

    for header, value in sorted(response.headers.items()):
        print(f"{header}: {value}")

    print("\n" + "=" * 60)
    print("CORS-specific headers:")
    print("-" * 60)

    cors_headers = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Expose-Headers',
        'Access-Control-Max-Age'
    ]

    for header in cors_headers:
        value = response.headers.get(header, 'NOT SET')
        status = "✓" if value != 'NOT SET' else "✗"
        print(f"{status} {header}: {value}")

    print("\n" + "=" * 60)

    # Check if all required headers are present
    if response.headers.get('Access-Control-Allow-Origin'):
        print("✓ CORS is configured")

        expose_headers = response.headers.get('Access-Control-Expose-Headers', '')
        required_for_audio = ['Content-Length', 'Content-Type', 'Content-Range', 'Accept-Ranges']

        print("\nRequired headers for Web Audio API:")
        for req in required_for_audio:
            if req.lower() in expose_headers.lower():
                print(f"  ✓ {req} is exposed")
            else:
                print(f"  ✗ {req} is NOT exposed (PROBLEM!)")
    else:
        print("✗ CORS is NOT configured!")

except Exception as e:
    print(f"Error: {e}")
