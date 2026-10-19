# MUMBAI MONSOON DRIVE

A stylized 3D browser driving game inspired by Mumbai roads, sea coast roads, bridges, and monsoon weather.

## Features
- Drivable car with keyboard and touch controls
- Stylized Mumbai-inspired landmarks:
  - Gateway of India inspired arch
  - Sea Link tower
  - Marine Drive lamps
- Busy traffic lanes
- Sunny and rainy weather modes
- Responsive browser layout for desktop and mobile
- Vercel-ready build configuration

## Run locally
1. Install dependencies:
   ```bash
   npm install$folder = "$env:USERPROFILE\Desktop\mumbai-monsoon-drive"
New-Item -Path $folder -ItemType Directory -Force | Out-Null
New-Item -Path "$folder\src" -ItemType Directory -Force | Out-Null
New-Item -Path "$folder\.github" -ItemType Directory -Force | Out-Null
New-Item -Path "$folder\.github\workflows" -ItemType Directory -Force | Out-Null

# package.json
Set-Content -Path "$folder\package.json" -Value @'
{
  "name": "mumbai-monsoon-drive",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173"
  },
  "dependencies": {
    "three": "^0.165.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "vite": "^5.3.4"
  }
}
