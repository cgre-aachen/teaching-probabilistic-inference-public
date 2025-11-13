// Medical Test Calculator - Interactive Bayesian Inference
// Based on the notebook: 01_Intro_test_statistics.ipynb

class MedicalTestCalculator {
    constructor() {
        this.prevalence = 1.0;
        this.sensitivity = 95.0;
        this.specificity = 95.0;
        
        this.setupControls();
        this.createVisualizations();
        this.updateAll();
    }

    // Calculate posterior probability using Bayes' theorem
    calculatePosterior() {
        const p_d = this.prevalence / 100;
        const p_t_given_d = this.sensitivity / 100;
        const p_t_given_not_d = (100 - this.specificity) / 100;
        
        const posterior = (p_t_given_d * p_d) / 
                         (p_t_given_d * p_d + p_t_given_not_d * (1 - p_d));
        
        return posterior;
    }

    // Calculate population statistics for 10,000 people
    calculatePopulationStats() {
        const total = 10000;
        const diseased = Math.round(total * this.prevalence / 100);
        const healthy = total - diseased;
        
        const true_positives = Math.round(diseased * this.sensitivity / 100);
        const false_negatives = diseased - true_positives;
        const true_negatives = Math.round(healthy * this.specificity / 100);
        const false_positives = healthy - true_negatives;
        
        return {
            total,
            diseased,
            healthy,
            true_positives,
            false_negatives,
            true_negatives,
            false_positives,
            total_positives: true_positives + false_positives,
            total_negatives: true_negatives + false_negatives
        };
    }

    setupControls() {
        const prevalenceSlider = document.getElementById('prevalence');
        const sensitivitySlider = document.getElementById('sensitivity');
        const specificitySlider = document.getElementById('specificity');

        prevalenceSlider.addEventListener('input', (e) => {
            this.prevalence = parseFloat(e.target.value);
            this.updateAll();
        });

        sensitivitySlider.addEventListener('input', (e) => {
            this.sensitivity = parseFloat(e.target.value);
            this.updateAll();
        });

        specificitySlider.addEventListener('input', (e) => {
            this.specificity = parseFloat(e.target.value);
            this.updateAll();
        });
    }

    updateAll() {
        this.updateControlLabels();
        this.updateResult();
        this.updatePopulationChart();
        this.updateProbabilityChart();
        this.updateRectangleDiagram();
        this.updateInsights();
    }

    updateControlLabels() {
        document.getElementById('prevalence-value').textContent = this.prevalence.toFixed(1) + '%';
        document.getElementById('sensitivity-value').textContent = this.sensitivity.toFixed(1) + '%';
        document.getElementById('specificity-value').textContent = this.specificity.toFixed(1) + '%';
    }

    updateResult() {
        const posterior = this.calculatePosterior();
        document.getElementById('result-probability').textContent = (posterior * 100).toFixed(1) + '%';
    }

    createVisualizations() {
        // Initialize SVG containers
        this.populationSvg = d3.select('#population-chart')
            .append('svg')
            .attr('width', 400)
            .attr('height', 300);

        this.probabilitySvg = d3.select('#probability-chart')
            .append('svg')
            .attr('width', 400)
            .attr('height', 300);

        this.rectangleSvg = d3.select('#rectangle-diagram')
            .append('svg')
            .attr('width', 500)
            .attr('height', 400);
    }

    updatePopulationChart() {
        const stats = this.calculatePopulationStats();
        const data = [
            { label: 'True Positives', value: stats.true_positives, color: '#3182ce' },
            { label: 'False Positives', value: stats.false_positives, color: '#e53e3e' },
            { label: 'False Negatives', value: stats.false_negatives, color: '#dd6b20' },
            { label: 'True Negatives', value: stats.true_negatives, color: '#38a169' }
        ];

        const margin = { top: 20, right: 30, bottom: 70, left: 60 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        this.populationSvg.selectAll('*').remove();

        const g = this.populationSvg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .nice()
            .range([height, 0]);

        // Bars
        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.label))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', d => d.color);

        // Value labels on bars
        g.selectAll('.bar-label')
            .data(data)
            .enter().append('text')
            .attr('class', 'bar-label')
            .attr('x', d => x(d.label) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => d.value);

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        g.append('g')
            .call(d3.axisLeft(y));

        // Update legend
        const legendHtml = data.map(d => 
            `<span style="color: ${d.color};">■</span> ${d.label}: ${d.value}`
        ).join(' | ');
        document.getElementById('population-legend').innerHTML = legendHtml;
    }

    updateProbabilityChart() {
        const posterior = this.calculatePosterior();
        const prior = this.prevalence / 100;
        
        const data = [
            { label: 'Prior P(Disease)', value: prior, color: '#805ad5' },
            { label: 'Posterior P(Disease|+)', value: posterior, color: '#3182ce' }
        ];

        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        this.probabilitySvg.selectAll('*').remove();

        const g = this.probabilitySvg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);

        // Bars
        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.label))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', d => d.color);

        // Value labels
        g.selectAll('.bar-label')
            .data(data)
            .enter().append('text')
            .attr('class', 'bar-label')
            .attr('x', d => x(d.label) + x.bandwidth() / 2)
            .attr('y', d => y(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => (d.value * 100).toFixed(1) + '%');

        // Axes
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append('g')
            .call(d3.axisLeft(y).tickFormat(d => (d * 100) + '%'));
    }

    updateRectangleDiagram() {
        const p_d = this.prevalence / 100;
        const sensitivity = this.sensitivity / 100;
        const specificity = this.specificity / 100;

        const width = 400;
        const height = 300;
        const margin = 50;

        this.rectangleSvg.selectAll('*').remove();

        const g = this.rectangleSvg.append('g')
            .attr('transform', `translate(${margin},${margin})`);

        const rectWidth = width - 2 * margin;
        const rectHeight = height - 2 * margin;

        // Calculate rectangle dimensions
        const diseased_width = p_d * rectWidth;
        const healthy_width = (1 - p_d) * rectWidth;

        // True Positives (blue)
        g.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', diseased_width)
            .attr('height', sensitivity * rectHeight)
            .attr('fill', '#3182ce')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        // False Negatives (orange)
        g.append('rect')
            .attr('x', 0)
            .attr('y', sensitivity * rectHeight)
            .attr('width', diseased_width)
            .attr('height', (1 - sensitivity) * rectHeight)
            .attr('fill', '#dd6b20')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        // False Positives (red)
        g.append('rect')
            .attr('x', diseased_width)
            .attr('y', 0)
            .attr('width', healthy_width)
            .attr('height', (1 - specificity) * rectHeight)
            .attr('fill', '#e53e3e')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        // True Negatives (green)
        g.append('rect')
            .attr('x', diseased_width)
            .attr('y', (1 - specificity) * rectHeight)
            .attr('width', healthy_width)
            .attr('height', specificity * rectHeight)
            .attr('fill', '#38a169')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        // Add labels
        const labelSize = 12;
        
        // Axes labels
        g.append('text')
            .attr('x', diseased_width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', labelSize + 'px')
            .style('font-weight', 'bold')
            .text('Has Disease');

        g.append('text')
            .attr('x', diseased_width + healthy_width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', labelSize + 'px')
            .style('font-weight', 'bold')
            .text('Healthy');

        g.append('text')
            .attr('x', -35)
            .attr('y', sensitivity * rectHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(-90, -35, ${sensitivity * rectHeight / 2})`)
            .style('font-size', labelSize + 'px')
            .style('font-weight', 'bold')
            .text('Test +');

        g.append('text')
            .attr('x', -35)
            .attr('y', sensitivity * rectHeight + (1 - sensitivity) * rectHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(-90, -35, ${sensitivity * rectHeight + (1 - sensitivity) * rectHeight / 2})`)
            .style('font-size', labelSize + 'px')
            .style('font-weight', 'bold')
            .text('Test -');
    }

    updateInsights() {
        const posterior = this.calculatePosterior();
        const stats = this.calculatePopulationStats();
        
        let insights = [];
        
        if (posterior < 0.5) {
            insights.push(`🔍 <strong>Even with a positive test, you're more likely to be healthy than sick!</strong> This demonstrates the base rate fallacy.`);
        }
        
        if (this.prevalence < 5) {
            insights.push(`📊 <strong>Low base rate alert:</strong> With only ${this.prevalence}% prevalence, most positive tests are false positives.`);
        }
        
        insights.push(`🧮 <strong>Out of ${stats.total_positives} people who test positive, only ${stats.true_positives} actually have the disease.</strong>`);
        
        if (posterior > 0.9) {
            insights.push(`✅ <strong>High confidence:</strong> With these parameters, a positive test gives ${(posterior * 100).toFixed(1)}% confidence.`);
        }
        
        insights.push(`🔄 <strong>Tip:</strong> Try adjusting the base rate slider to see how dramatically it affects the result!`);
        
        document.getElementById('insights').innerHTML = insights.join('<br><br>');
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new MedicalTestCalculator();
});