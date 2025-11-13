// 1D MCMC Animation - Interactive Metropolis-Hastings
// Based on notebook: 03_1d_mcmc_exercise.ipynb

class MCMC1D {
    constructor() {
        // Parameters
        this.proposalStd = 0.5;
        this.targetMean = 0.0;
        this.targetStd = 1.0;
        this.animationSpeed = 3;
        
        // Sampling state
        this.currentPosition = 0.0;
        this.proposedPosition = 0.0;
        this.samples = [];
        this.acceptedSamples = 0;
        this.isRunning = false;
        this.animationId = null;
        
        // Chart dimensions
        this.chartWidth = 400;
        this.chartHeight = 250;
        this.margin = { top: 20, right: 30, bottom: 40, left: 50 };
        
        this.setupControls();
        this.createVisualizations();
        this.updateAll();
    }

    // Target distribution (Gaussian)
    targetDensity(x) {
        const variance = this.targetStd * this.targetStd;
        return Math.exp(-0.5 * Math.pow(x - this.targetMean, 2) / variance) / 
               Math.sqrt(2 * Math.PI * variance);
    }

    // Propose new position
    proposePosition() {
        return this.currentPosition + (Math.random() - 0.5) * 2 * this.proposalStd * Math.sqrt(12);
    }

    // Metropolis acceptance criterion
    acceptProposal(current, proposed) {
        const currentProb = this.targetDensity(current);
        const proposedProb = this.targetDensity(proposed);
        const acceptanceRatio = proposedProb / currentProb;
        return Math.random() < Math.min(1, acceptanceRatio);
    }

    setupControls() {
        const controls = {
            'proposal-std': (val) => { this.proposalStd = parseFloat(val); },
            'target-mean': (val) => { this.targetMean = parseFloat(val); },
            'target-std': (val) => { this.targetStd = parseFloat(val); },
            'animation-speed': (val) => { 
                this.animationSpeed = parseInt(val);
                this.updateAnimationSpeedLabel();
            }
        };

        Object.entries(controls).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            element.addEventListener('input', (e) => {
                handler(e.target.value);
                this.updateAll();
            });
        });

        // Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startSampling());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseSampling());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSampling());
        
        this.updateAnimationSpeedLabel();
    }

    updateAnimationSpeedLabel() {
        const labels = ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'];
        document.getElementById('animation-speed-value').textContent = labels[this.animationSpeed - 1];
    }

    startSampling() {
        this.isRunning = true;
        this.animate();
    }

    pauseSampling() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resetSampling() {
        this.pauseSampling();
        this.currentPosition = 0.0;
        this.proposedPosition = 0.0;
        this.samples = [];
        this.acceptedSamples = 0;
        this.updateAll();
    }

    animate() {
        if (!this.isRunning) return;

        // Perform MCMC step
        this.proposedPosition = this.proposePosition();
        const accepted = this.acceptProposal(this.currentPosition, this.proposedPosition);
        
        if (accepted) {
            this.currentPosition = this.proposedPosition;
            this.acceptedSamples++;
        }
        
        this.samples.push(this.currentPosition);
        
        // Update visualizations
        this.updateAll();
        
        // Continue animation with speed control
        const delay = Math.max(1, 6 - this.animationSpeed) * 100;
        setTimeout(() => {
            this.animationId = requestAnimationFrame(() => this.animate());
        }, delay);
    }

    updateAll() {
        this.updateControlLabels();
        this.updateStats();
        this.updateTargetChart();
        this.updateTraceChart();
        this.updateHistogram();
        this.updateProposalChart();
    }

    updateControlLabels() {
        document.getElementById('proposal-std-value').textContent = this.proposalStd.toFixed(1);
        document.getElementById('target-mean-value').textContent = this.targetMean.toFixed(1);
        document.getElementById('target-std-value').textContent = this.targetStd.toFixed(1);
    }

    updateStats() {
        document.getElementById('sample-count').textContent = this.samples.length;
        const acceptanceRate = this.samples.length > 0 ? 
            (this.acceptedSamples / this.samples.length * 100).toFixed(1) : 0;
        document.getElementById('acceptance-rate').textContent = acceptanceRate + '%';
    }

    createVisualizations() {
        // Create SVG containers
        this.targetSvg = this.createSvg('#target-chart');
        this.traceSvg = this.createSvg('#trace-chart');
        this.histogramSvg = this.createSvg('#histogram-chart');
        this.proposalSvg = this.createSvg('#proposal-chart');
    }

    createSvg(selector) {
        return d3.select(selector)
            .append('svg')
            .attr('width', this.chartWidth)
            .attr('height', this.chartHeight);
    }

    updateTargetChart() {
        const svg = this.targetSvg;
        const width = this.chartWidth - this.margin.left - this.margin.right;
        const height = this.chartHeight - this.margin.top - this.margin.bottom;

        svg.selectAll('*').remove();
        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Create target distribution curve
        const xRange = [this.targetMean - 4 * this.targetStd, this.targetMean + 4 * this.targetStd];
        const xScale = d3.scaleLinear().domain(xRange).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, this.targetDensity(this.targetMean) * 1.1]).range([height, 0]);

        // Draw target distribution
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveCardinal);

        const targetData = [];
        for (let x = xRange[0]; x <= xRange[1]; x += (xRange[1] - xRange[0]) / 100) {
            targetData.push({ x: x, y: this.targetDensity(x) });
        }

        g.append('path')
            .datum(targetData)
            .attr('fill', 'none')
            .attr('stroke', '#4299e1')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Draw current position
        if (this.samples.length > 0) {
            g.append('circle')
                .attr('cx', xScale(this.currentPosition))
                .attr('cy', height - 10)
                .attr('r', 6)
                .attr('fill', '#e53e3e')
                .attr('stroke', 'white')
                .attr('stroke-width', 2);

            // Draw vertical line from current position to distribution
            g.append('line')
                .attr('x1', xScale(this.currentPosition))
                .attr('x2', xScale(this.currentPosition))
                .attr('y1', height - 10)
                .attr('y2', yScale(this.targetDensity(this.currentPosition)))
                .attr('stroke', '#e53e3e')
                .attr('stroke-dasharray', '3,3')
                .attr('opacity', 0.7);
        }

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));
        
        g.append('g')
            .call(d3.axisLeft(yScale));

        // Labels
        g.append('text')
            .attr('x', width / 2)
            .attr('y', height + 35)
            .attr('text-anchor', 'middle')
            .text('x');
    }

    updateTraceChart() {
        if (this.samples.length === 0) return;

        const svg = this.traceSvg;
        const width = this.chartWidth - this.margin.left - this.margin.right;
        const height = this.chartHeight - this.margin.top - this.margin.bottom;

        svg.selectAll('*').remove();
        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([0, Math.max(this.samples.length, 100)])
            .range([0, width]);

        const yExtent = d3.extent(this.samples);
        const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
        const yScale = d3.scaleLinear()
            .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
            .range([height, 0]);

        // Draw trace line
        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d));

        g.append('path')
            .datum(this.samples)
            .attr('fill', 'none')
            .attr('stroke', '#38a169')
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Highlight recent points
        const recentSamples = this.samples.slice(-20);
        const startIndex = Math.max(0, this.samples.length - 20);

        g.selectAll('.recent-point')
            .data(recentSamples)
            .enter().append('circle')
            .attr('class', 'recent-point')
            .attr('cx', (d, i) => xScale(startIndex + i))
            .attr('cy', d => yScale(d))
            .attr('r', 2)
            .attr('fill', '#e53e3e')
            .attr('opacity', (d, i) => 0.3 + 0.7 * (i / recentSamples.length));

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));
        
        g.append('g')
            .call(d3.axisLeft(yScale));

        // Labels
        g.append('text')
            .attr('x', width / 2)
            .attr('y', height + 35)
            .attr('text-anchor', 'middle')
            .text('Sample Number');
    }

    updateHistogram() {
        if (this.samples.length < 10) return;

        const svg = this.histogramSvg;
        const width = this.chartWidth - this.margin.left - this.margin.right;
        const height = this.chartHeight - this.margin.top - this.margin.bottom;

        svg.selectAll('*').remove();
        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Create histogram
        const xExtent = d3.extent(this.samples);
        const binCount = Math.min(20, Math.floor(Math.sqrt(this.samples.length)));
        
        const xScale = d3.scaleLinear()
            .domain(xExtent)
            .range([0, width]);

        const histogram = d3.histogram()
            .domain(xScale.domain())
            .thresholds(xScale.ticks(binCount));

        const bins = histogram(this.samples);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .range([height, 0]);

        // Draw bars
        g.selectAll('.bar')
            .data(bins)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.x0))
            .attr('y', d => yScale(d.length))
            .attr('width', d => xScale(d.x1) - xScale(d.x0) - 1)
            .attr('height', d => height - yScale(d.length))
            .attr('fill', '#805ad5')
            .attr('opacity', 0.7);

        // Overlay target distribution for comparison
        const targetData = [];
        const targetScale = d3.max(bins, d => d.length) / this.targetDensity(this.targetMean);
        
        for (let x = xExtent[0]; x <= xExtent[1]; x += (xExtent[1] - xExtent[0]) / 100) {
            targetData.push({ x: x, y: this.targetDensity(x) * targetScale });
        }

        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveCardinal);

        g.append('path')
            .datum(targetData)
            .attr('fill', 'none')
            .attr('stroke', '#e53e3e')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));
        
        g.append('g')
            .call(d3.axisLeft(yScale));
    }

    updateProposalChart() {
        const svg = this.proposalSvg;
        const width = this.chartWidth - this.margin.left - this.margin.right;
        const height = this.chartHeight - this.margin.top - this.margin.bottom;

        svg.selectAll('*').remove();
        const g = svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        if (this.samples.length === 0) {
            g.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('fill', '#666')
                .text('Click Start to begin sampling');
            return;
        }

        // Show proposal distribution around current position
        const xRange = [this.currentPosition - 3 * this.proposalStd, 
                       this.currentPosition + 3 * this.proposalStd];
        const xScale = d3.scaleLinear().domain(xRange).range([0, width]);
        
        // Proposal distribution (normal around current position)
        const proposalDensity = (x) => {
            const variance = this.proposalStd * this.proposalStd;
            return Math.exp(-0.5 * Math.pow(x - this.currentPosition, 2) / variance) / 
                   Math.sqrt(2 * Math.PI * variance);
        };

        const maxDensity = proposalDensity(this.currentPosition);
        const yScale = d3.scaleLinear().domain([0, maxDensity * 1.1]).range([height, 0]);

        // Draw proposal distribution
        const proposalData = [];
        for (let x = xRange[0]; x <= xRange[1]; x += (xRange[1] - xRange[0]) / 100) {
            proposalData.push({ x: x, y: proposalDensity(x) });
        }

        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveCardinal);

        g.append('path')
            .datum(proposalData)
            .attr('fill', 'rgba(255, 149, 0, 0.3)')
            .attr('stroke', '#ff9500')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Current position
        g.append('circle')
            .attr('cx', xScale(this.currentPosition))
            .attr('cy', height - 20)
            .attr('r', 6)
            .attr('fill', '#e53e3e')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Proposed position (if we have one)
        if (this.isRunning) {
            g.append('circle')
                .attr('cx', xScale(this.proposedPosition))
                .attr('cy', height - 20)
                .attr('r', 6)
                .attr('fill', '#ff9500')
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .attr('opacity', 0.8);
        }

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Update info text
        const currentDensity = this.targetDensity(this.currentPosition);
        const proposedDensity = this.targetDensity(this.proposedPosition);
        const acceptanceRatio = Math.min(1, proposedDensity / currentDensity);
        
        const infoText = this.isRunning ? 
            `Current: ${this.currentPosition.toFixed(2)} | Proposed: ${this.proposedPosition.toFixed(2)} | ` +
            `Accept Prob: ${(acceptanceRatio * 100).toFixed(1)}%` :
            `Current position: ${this.currentPosition.toFixed(2)}`;
            
        document.getElementById('proposal-info').textContent = infoText;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    new MCMC1D();
});