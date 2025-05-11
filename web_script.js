// Global variables
let appliances = [];
let totalWh = 0;
let solarResults = {};

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.remove('hidden');
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Generate results if going to results page
    if (pageId === 'results-page') {
        generateResults();
    }
}

// Appliance management
document.getElementById('add-appliance').addEventListener('click', function() {
    const name = document.getElementById('appliance-name').value;
    const wattage = parseFloat(document.getElementById('wattage').value);
    const hours = parseFloat(document.getElementById('hours').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (!name || isNaN(wattage) || isNaN(hours) || isNaN(quantity)) {
        alert("Please fill all fields correctly!");
        return;
    }
    
    const dailyWh = wattage * hours * quantity;
    appliances.push({ name, wattage, hours, quantity, dailyWh });
    updateApplianceTable();
    
    // Reset form
    document.getElementById('appliance-name').value = '';
    document.getElementById('wattage').value = '';
    document.getElementById('hours').value = '';
    document.getElementById('quantity').value = '1';
});

function updateApplianceTable() {
    const tableBody = document.getElementById('appliance-list');
    tableBody.innerHTML = '';
    totalWh = 0;
    
    appliances.forEach((appliance, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appliance.name}</td>
            <td>${appliance.wattage}</td>
            <td>${appliance.hours}</td>
            <td>${appliance.quantity}</td>
            <td>${appliance.dailyWh}</td>
            <td><button onclick="removeAppliance(${index})">Remove</button></td>
        `;
        tableBody.appendChild(row);
        totalWh += appliance.dailyWh;
    });
    
    document.getElementById('total-consumption').textContent = `${totalWh} Wh`;
    
    // Show solar options if we have appliances
    if (appliances.length > 0) {
        document.getElementById('solar-options').classList.remove('hidden');
        document.getElementById('calculate-btn').classList.remove('hidden');
    }
}

function removeAppliance(index) {
    appliances.splice(index, 1);
    updateApplianceTable();
}

// Solar calculations
document.getElementById('calculate-btn').addEventListener('click', function() {
    calculateSolarRequirements();
    showPage('results-page');
});

function calculateSolarRequirements() {
    const nominalPower = 293;     // W per panel
    const sunHours = 5;           // Peak sun hours
    const deratingFactor = 0.9;   // 10% panel losses
    const systemLosses = 0.85;    // 15% system losses
    const systemVoltage = 48;     // System voltage
    const moduleVmax = 36;        // Panel max voltage
    const moduleCost = 10500;     // Cost per panel
    const batteryCost = 11900;     // Cost per battery
    const inverterCost = 35000;    // Inverter cost
    const installationCost = 30000; // Installation cost
    const electricityRate = 6.5;   // ₹/kWh

    // Energy calculations
    const energyPerModule = nominalPower * sunHours;
    const realEnergyOutput = deratingFactor * energyPerModule;
    const requiredArrayOutput = totalWh / systemLosses;
    const modulesNeeded = Math.ceil(requiredArrayOutput / realEnergyOutput);

    // String calculations
    const modulesPerString = Math.floor(systemVoltage / moduleVmax) || 1;
    const parallelStrings = Math.ceil(modulesNeeded / modulesPerString);
    const totalModulesToPurchase = modulesPerString * parallelStrings;

    // Economic calculations
    const capitalCost = (totalModulesToPurchase * moduleCost) + 
                       (2 * batteryCost) + inverterCost + installationCost;
    const annualSavings = (totalWh / 1000) * 365 * electricityRate;
    const paybackPeriod = capitalCost / annualSavings;

    // Save results
    solarResults = {
        appliances,
        totalWh,
        solarConfig: {
            modulesNeeded,
            modulesPerString,
            parallelStrings,
            totalModulesToPurchase,
            nominalPower,
            systemVoltage
        },
        economic: {
            capitalCost,
            annualSavings,
            paybackPeriod
        }
    };
}

// Results generation
function generateResults() {
    const resultsContainer = document.getElementById('results-container');
    
    resultsContainer.innerHTML = `
        <div class="summary">
            <div class="summary-item">
                <h3>Daily Consumption</h3>
                <p>${solarResults.totalWh} Wh</p>
            </div>
            <div class="summary-item">
                <h3>Panels Required</h3>
                <p>${solarResults.solarConfig.totalModulesToPurchase} × ${solarResults.solarConfig.nominalPower}W</p>
            </div>
            <div class="summary-item">
                <h3>System Cost</h3>
                <p>₹${solarResults.economic.capitalCost.toLocaleString()}</p>
            </div>
            <div class="summary-item">
                <h3>Payback Period</h3>
                <p>${solarResults.economic.paybackPeriod.toFixed(1)} years</p>
            </div>
        </div>

        <div class="result-card">
            <h2>Energy Analysis</h2>
            <h3>Appliance Breakdown</h3>
            <table>
                <thead>
                    <tr>
                        <th>Appliance</th>
                        <th>Wattage</th>
                        <th>Hours/Day</th>
                        <th>Quantity</th>
                        <th>Daily Usage</th>
                    </tr>
                </thead>
                <tbody>
                    ${solarResults.appliances.map(appliance => `
                        <tr>
                            <td>${appliance.name}</td>
                            <td>${appliance.wattage} W</td>
                            <td>${appliance.hours}</td>
                            <td>${appliance.quantity}</td>
                            <td>${appliance.dailyWh} Wh</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="result-card">
            <h2>Solar Configuration</h2>
            <p><strong>Total Modules Needed:</strong> ${solarResults.solarConfig.modulesNeeded}</p>
            <p><strong>System Voltage:</strong> ${solarResults.solarConfig.systemVoltage}V</p>
            <p><strong>Modules per String:</strong> ${solarResults.solarConfig.modulesPerString}</p>
            <p><strong>Parallel Strings Needed:</strong> ${solarResults.solarConfig.parallelStrings}</p>
            <p><strong>Total Modules to Purchase:</strong> ${solarResults.solarConfig.totalModulesToPurchase}</p>
        </div>

        <div class="result-card">
            <h2>Financial Analysis</h2>
            <h3>Cost Breakdown</h3>
            <p><strong>Solar Panels:</strong> ₹${(solarResults.solarConfig.totalModulesToPurchase * 10500).toLocaleString()}</p>
            <p><strong>Batteries (2 × ₹11,900):</strong> ₹${(2 * 11900).toLocaleString()}</p>
            <p><strong>Inverter:</strong> ₹35,000</p>
            <p><strong>Installation:</strong> ₹30,000</p>
            <p><strong>Total Initial Cost:</strong> ₹${solarResults.economic.capitalCost.toLocaleString()}</p>
            
            <h3>Savings</h3>
            <p><strong>Annual Savings:</strong> ₹${solarResults.economic.annualSavings.toLocaleString()}</p>
            <p><strong>Payback Period:</strong> ${solarResults.economic.paybackPeriod.toFixed(1)} years</p>
        </div>
    `;
}