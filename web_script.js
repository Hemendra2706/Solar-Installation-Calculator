document.addEventListener('DOMContentLoaded', function() {
    const addApplianceBtn = document.getElementById('add-appliance');
    const applianceList = document.getElementById('appliance-list');
    const totalConsumption = document.getElementById('total-consumption');
    const calculateSolarBtn = document.getElementById('calculate-solar');
    const solarResults = document.getElementById('solar-results');
    const solarCalcResults = document.getElementById('solar-calculation-results');
    const calculateEconomicBtn = document.getElementById('calculate-economic');
    const economicResults = document.getElementById('economic-results');
    const economicCalcResults = document.getElementById('economic-calculation-results');
    
    let appliances = [];
    let totalWh = 0;
    let modulesNeeded = 0;
    
    // Add appliance to the list
    addApplianceBtn.addEventListener('click', function() {
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
    
    // Update appliance table
    function updateApplianceTable() {
        applianceList.innerHTML = '';
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
            applianceList.appendChild(row);
            totalWh += appliance.dailyWh;
        });
        
        totalConsumption.textContent = `${totalWh} Wh`;
        
        // Show calculate solar button if we have appliances
        if (appliances.length > 0) {
            calculateSolarBtn.classList.remove('hidden');
        } else {
            calculateSolarBtn.classList.add('hidden');
        }
    }
    
    // Remove appliance
    window.removeAppliance = function(index) {
        appliances.splice(index, 1);
        updateApplianceTable();
    };
    
    // Calculate solar requirements
    calculateSolarBtn.addEventListener('click', function() {
        const nominalPower = 293;     // W per panel
        const sunHours = 5;           // Peak sun hours
        const deratingFactor = 0.9;   // 10% panel losses
        const systemLosses = 0.85;    // 15% system losses
        const systemVoltage = 48;     // System voltage
        const moduleVmax = 36;        // Panel max voltage

        // Energy calculations
        const energyPerModule = nominalPower * sunHours;
        const realEnergyOutput = deratingFactor * energyPerModule;
        const requiredArrayOutput = totalWh / systemLosses;
        modulesNeeded = Math.ceil(requiredArrayOutput / realEnergyOutput);

        // String calculations
        const modulesPerString = Math.floor(systemVoltage / moduleVmax) || 1;
        const parallelStrings = Math.ceil(modulesNeeded / modulesPerString);
        const totalModulesToPurchase = modulesPerString * parallelStrings;

        // Display results
        solarCalcResults.innerHTML = `
            <h3>Energy Requirements</h3>
            <p><strong>Total Daily Consumption:</strong> ${totalWh} Wh</p>
            <p><strong>After System Losses (15%):</strong> ${requiredArrayOutput.toFixed(2)} Wh needed</p>
            
            <h3>Panel Specifications</h3>
            <p><strong>Panel Rated Power:</strong> ${nominalPower}W</p>
            <p><strong>Real Panel Output (${nominalPower}W × ${sunHours}h × ${deratingFactor}):</strong> ${realEnergyOutput} Wh/day</p>
            
            <h3>System Configuration</h3>
            <p><strong>Modules Required:</strong> ${modulesNeeded}</p>
            <p><strong>System Voltage:</strong> ${systemVoltage}V</p>
            <p><strong>Module V<sub>max</sub>:</strong> ${moduleVmax}V</p>
            <p><strong>Modules per String:</strong> ${modulesPerString}</p>
            <p><strong>Parallel Strings Needed:</strong> ${parallelStrings}</p>
            <p><strong>Total Modules to Purchase:</strong> ${totalModulesToPurchase}</p>
        `;

        solarResults.classList.remove('hidden');
        document.getElementById('economic-input').classList.remove('hidden');
    });
    
    // Calculate economic analysis
    calculateEconomicBtn.addEventListener('click', function() {
        const moduleCost = parseFloat(document.getElementById('module-cost').value);
        const batteryCount = parseInt(document.getElementById('battery-count').value);
        const inverterCost = parseFloat(document.getElementById('inverter-cost').value);
        const installationCost = parseFloat(document.getElementById('installation-cost').value);
        const electricityRate = parseFloat(document.getElementById('electricity-rate').value);
        
        const batteryCost = batteryCount * 11900;
        const totalModuleCost = modulesNeeded * moduleCost;
        const capitalCost = totalModuleCost + batteryCost + inverterCost + installationCost;
        
        // Lifetime calculations (25 years)
        const lifespan = 25;
        const annualOMCost = 0.005 * capitalCost; // 0.5% of capital cost
        const totalOMCost = annualOMCost * lifespan;
        
        // Replacement costs (batteries and inverter after 15 years)
        const replacementCost = (batteryCost + inverterCost);
        
        // Salvage value (10% of capital cost)
        const salvageValue = 0.1 * capitalCost;
        
        // Lifetime energy production (from your input)
        const lifetimeEnergy = 2164000; // kWh
        
        // LCOE Calculation
        const LCC = capitalCost + totalOMCost + replacementCost - salvageValue;
        const LCOE = LCC / lifetimeEnergy;
        
        // Payback period
        const annualSavings = (totalWh / 1000) * 365 * electricityRate;
        const paybackPeriod = capitalCost / annualSavings;
        
        // Display results
        economicCalcResults.innerHTML = `
            <h3>Cost Breakdown</h3>
            <p><strong>Solar Panels:</strong> ₹${totalModuleCost.toLocaleString()}</p>
            <p><strong>Batteries (${batteryCount} × ₹11,900):</strong> ₹${batteryCost.toLocaleString()}</p>
            <p><strong>Inverter:</strong> ₹${inverterCost.toLocaleString()}</p>
            <p><strong>Installation:</strong> ₹${installationCost.toLocaleString()}</p>
            <p><strong>Total Initial Cost:</strong> ₹${capitalCost.toLocaleString()}</p>
            
            <h3>Lifetime Costs (${lifespan} years)</h3>
            <p><strong>O&M Costs (0.5% annually):</strong> ₹${totalOMCost.toLocaleString()}</p>
            <p><strong>Replacement Costs (after 15 years):</strong> ₹${replacementCost.toLocaleString()}</p>
            <p><strong>Salvage Value (10%):</strong> ₹${salvageValue.toLocaleString()}</p>
            <p><strong>Total Lifetime Cost (LCC):</strong> ₹${LCC.toLocaleString()}</p>
            
            <h3>Financial Analysis</h3>
            <p><strong>Levelized Cost of Energy (LCOE):</strong> ₹${LCOE.toFixed(2)} per kWh</p>
            <p><strong>Annual Savings:</strong> ₹${annualSavings.toLocaleString()}</p>
            <p><strong>Payback Period:</strong> ${paybackPeriod.toFixed(1)} years</p>
        `;
        
        economicResults.classList.remove('hidden');
    });
});