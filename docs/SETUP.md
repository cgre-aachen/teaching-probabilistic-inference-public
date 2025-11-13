# GitHub Pages Deployment Guide

## Quick Setup Steps

1. **Push the `docs` folder to your GitHub repository**
   ```bash
   cd /path/to/your/repo
   git add docs/
   git commit -m "Add interactive probabilistic inference web app"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub.com
   - Click **Settings** tab
   - Scroll down to **Pages** section
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/docs** folder
   - Click **Save**

3. **Access Your App**
   - Your app will be available at: `https://YOUR_USERNAME.github.io/teaching-probabilistic-inference/`
   - It may take a few minutes for the site to become available

## What's Included

### Interactive Demos
- **Medical Test Calculator**: Bayes' theorem with base rate fallacy demonstration
- **1D MCMC Animation**: Live Metropolis-Hastings sampling visualization
- **Coming Soon**: Multimodal distribution explorer and convergence diagnostics

### Features
- Responsive design for all devices
- D3.js visualizations
- Real-time parameter adjustment
- Educational content integration
- Links back to your Jupyter notebooks

## File Structure
```
docs/
├── index.html              # Main landing page
├── styles.css              # Shared styling
├── images/                 # Thumbnail images
├── medical-test/           # Medical test calculator
│   ├── index.html
│   └── medical-test.js
└── mcmc-1d/               # MCMC animation
    ├── index.html
    └── mcmc-1d.js
```

## Customization

### Update Repository Link
Edit `docs/index.html` line 14 to point to your actual repository:
```html
<a href="https://github.com/YOUR_USERNAME/teaching-probabilistic-inference" target="_blank">📚 Jupyter Notebooks</a>
```

### Add More Demos
1. Create a new directory in `docs/` (e.g., `docs/new-demo/`)
2. Add HTML and JavaScript files
3. Add a new tile to the main `index.html`
4. Create a thumbnail image in `docs/images/`

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- No server required - runs entirely client-side

## Educational Integration
The web app complements your existing Jupyter notebooks by providing:
- Interactive exploration of concepts
- Visual understanding of complex algorithms
- Hands-on parameter experimentation
- Mobile-friendly classroom access