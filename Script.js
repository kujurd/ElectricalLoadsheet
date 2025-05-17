let areas = [];
const COMMON_APPLIANCES = {
    // Lighting
    "LED Bulb (5W)": 5, "LED Bulb (9W)": 9, "LED Bulb (12W)": 12, "LED Tube Light (18W)": 18, "LED Tube Light (22W)": 22, "CFL (15W)": 15, "Incandescent Bulb (60W)": 60, "Chandelier (Small)": 100, "Chandelier (Large)": 300, "Downlight/Spotlight (LED 7W)": 7,
    // Fans
    "Ceiling Fan": 75, "Exhaust Fan (Small)": 25, "Exhaust Fan (Large)": 50, "Pedestal Fan": 60, "Wall Fan": 55,
    // Living Room & Bedroom
    "Television (LED 32\")": 50, "Television (LED 43\")": 75, "Television (LED 55\")": 120, "Television (LED 65\")": 180, "Home Theater System": 300, "Set-Top Box": 20, "Gaming Console": 150, "Laptop": 65, "Desktop Computer (with Monitor)": 250, "Wi-Fi Router": 10, "Mobile Charger": 5, "Air Cooler (Small)": 150, "Air Cooler (Large)": 250,
    // Air Conditioning
    "AC (1 Ton Inverter)": 1000, "AC (1.5 Ton Inverter)": 1500, "AC (2 Ton Inverter)": 2000, "AC (1 Ton Non-Inverter)": 1200, "AC (1.5 Ton Non-Inverter)": 1800, "AC (2 Ton Non-Inverter)": 2400,
    // Kitchen
    "Refrigerator (Single Door, <250L)": 150, "Refrigerator (Double Door, <350L)": 200, "Refrigerator (Side-by-Side)": 300, "Microwave Oven": 1200, "Oven (Built-in)": 2500, "Induction Cooktop (1 Zone)": 1800, "Induction Cooktop (2 Zones)": 3000, "Mixer Grinder": 750, "Blender": 300, "Toaster": 800, "Electric Kettle": 1500, "Water Purifier (RO+UV)": 30, "Dishwasher": 1500, "Chimney/Hood": 200,
    // Bathroom & Utility
    "Water Heater/Geyser (Storage 15L)": 2000, "Water Heater/Geyser (Storage 25L)": 3000, "Water Heater/Geyser (Instant 3kW)": 3000, "Water Heater/Geyser (Instant 6kW)": 6000, "Washing Machine (Semi-Automatic)": 400, "Washing Machine (Top Load Automatic)": 500, "Washing Machine (Front Load Automatic)": 2000, "Clothes Dryer": 2500, "Iron Box": 1000, "Hair Dryer": 1500, "Vacuum Cleaner": 1200,
    // Pumps
    "Water Pump (0.5 HP)": 375, "Water Pump (1 HP)": 750, "Submersible Pump (1 HP)": 750,
    // General Sockets (for miscellaneous loads)
    "5A Socket Outlet": 100
};

document.addEventListener('DOMContentLoaded', () => {
    // Element selectors
    const addAreaBtn = document.getElementById('addAreaBtn');
    const areasContainer = document.getElementById('areasContainer');
    
    const projectNameInput = document.getElementById('projectName');
    const clientNameInput = document.getElementById('clientName');
    const projectAddressInput = document.getElementById('projectAddress');
    const calcDateInput = document.getElementById('calcDate');

    const voltageInput = document.getElementById('voltage');
    const phaseInput = document.getElementById('phase');
    const powerFactorInput = document.getElementById('powerFactor');
    const diversityFactorInput = document.getElementById('diversityFactor');
    
    const totalConnectedLoadWEl = document.getElementById('totalConnectedLoadW');
    const totalConnectedLoadKWEl = document.getElementById('totalConnectedLoadKW');
    const maxDemandWEl = document.getElementById('maxDemandW');
    const maxDemandKWEl = document.getElementById('maxDemandKW');
    const calculatedCurrentEl = document.getElementById('calculatedCurrent');

    const printBtn = document.getElementById('printBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    let areaIdCounter = 0;

    function createAreaElement(area) {
        const areaCard = document.createElement('div');
        areaCard.className = 'area-card';
        areaCard.dataset.areaId = area.id;

        areaCard.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <input type="text" value="${area.name}" class="input-field area-name-input font-semibold text-lg text-indigo-700 flex-grow" placeholder="Enter Area Name (e.g., Kitchen)">
                <button class="btn btn-danger btn-sm remove-area-btn ml-4">Remove Area</button>
            </div>
            <table class="appliance-table">
                <thead>
                    <tr>
                        <th class="w-2/5">Appliance</th>
                        <th class="w-1/5">Wattage (W)</th>
                        <th class="w-1/5">Quantity</th>
                        <th class="w-1/5">Total (W)</th>
                        <th class="w-1/12"></th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Appliance rows will be added here -->
                </tbody>
            </table>
            <div class="mt-4 flex flex-col sm:flex-row justify-between items-center">
                <div class="flex space-x-2 mb-3 sm:mb-0">
                     <button class="btn btn-primary btn-sm add-appliance-btn">Add Appliance</button>
                     <button class="btn btn-secondary btn-sm add-common-appliance-btn">Add Common</button>
                </div>
                <div class="text-right font-semibold">
                    Area Subtotal: <span class="area-subtotal text-indigo-600">0 W</span>
                </div>
            </div>
        `;

        const areaNameInputEl = areaCard.querySelector('.area-name-input');
        areaNameInputEl.addEventListener('input', (e) => {
            area.name = e.target.value;
            saveState();
        });

        const removeAreaBtnEl = areaCard.querySelector('.remove-area-btn');
        removeAreaBtnEl.addEventListener('click', () => {
            areas = areas.filter(a => a.id !== area.id);
            renderAreas();
            calculateTotals();
            saveState();
        });

        const addApplianceBtnEl = areaCard.querySelector('.add-appliance-btn');
        addApplianceBtnEl.addEventListener('click', () => {
            addApplianceToArea(area.id);
        });

        const addCommonApplianceBtnEl = areaCard.querySelector('.add-common-appliance-btn');
        addCommonApplianceBtnEl.addEventListener('click', () => {
            showCommonApplianceModal(area.id);
        });
        
        const tbody = areaCard.querySelector('tbody');
        area.appliances.forEach(appliance => {
            tbody.appendChild(createApplianceRowElement(area.id, appliance));
        });

        updateAreaSubtotal(area.id);
        return areaCard;
    }
    
    function createApplianceRowElement(areaId, appliance) {
        const tr = document.createElement('tr');
        tr.dataset.applianceId = appliance.id;
        tr.innerHTML = `
            <td><input type="text" class="input-field input-field-sm appliance-name" value="${appliance.name}" placeholder="Appliance Name"></td>
            <td><input type="number" class="input-field input-field-sm appliance-wattage" value="${appliance.wattage}" min="0" placeholder="e.g. 100"></td>
            <td><input type="number" class="input-field input-field-sm appliance-quantity" value="${appliance.quantity}" min="1" placeholder="e.g. 1"></td>
            <td class="appliance-total-wattage font-medium">${(appliance.wattage * appliance.quantity).toFixed(0)} W</td>
            <td><button class="btn btn-danger btn-sm remove-appliance-btn p-2 text-xs">✕</button></td>
        `;

        tr.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('input', () => {
                const area = areas.find(a => a.id === areaId);
                if (!area) return;
                const currentAppliance = area.appliances.find(app => app.id === appliance.id);
                if (!currentAppliance) return;
                
                currentAppliance.name = tr.querySelector('.appliance-name').value;
                currentAppliance.wattage = parseFloat(tr.querySelector('.appliance-wattage').value) || 0;
                currentAppliance.quantity = parseInt(tr.querySelector('.appliance-quantity').value) || 1;
                
                tr.querySelector('.appliance-total-wattage').textContent = `${(currentAppliance.wattage * currentAppliance.quantity).toFixed(0)} W`;
                updateAreaSubtotal(areaId);
                calculateTotals();
                saveState();
            });
        });

        tr.querySelector('.remove-appliance-btn').addEventListener('click', () => {
            const area = areas.find(a => a.id === areaId);
            if (!area) return;
            area.appliances = area.appliances.filter(app => app.id !== appliance.id);
            tr.remove();
            updateAreaSubtotal(areaId);
            calculateTotals();
            saveState();
        });
        return tr;
    }

    function showCommonApplianceModal(areaId) {
        let options = "Select a common appliance:\n";
        let i = 1;
        const applianceKeys = Object.keys(COMMON_APPLIANCES);
        for (const key of applianceKeys) {
            options += `${i}. ${key} (${COMMON_APPLIANCES[key]}W)\n`;
            i++;
        }
        options += "\nEnter number or name (or part of name):";

        const choice = prompt(options);
        if (choice) {
            let selectedApplianceName = null;
            let selectedApplianceWattage = 0;

            const choiceNum = parseInt(choice);
            if (!isNaN(choiceNum) && choiceNum > 0 && choiceNum <= applianceKeys.length) {
                selectedApplianceName = applianceKeys[choiceNum - 1];
                selectedApplianceWattage = COMMON_APPLIANCES[selectedApplianceName];
            } else { 
                const lowerChoice = choice.toLowerCase();
                for (const key of applianceKeys) {
                    if (key.toLowerCase().includes(lowerChoice)) {
                        selectedApplianceName = key;
                        selectedApplianceWattage = COMMON_APPLIANCES[key];
                        break;
                    }
                }
            }

            if (selectedApplianceName) {
                 addApplianceToArea(areaId, selectedApplianceName, selectedApplianceWattage, 1);
            } else {
                alert("Invalid selection.");
            }
        }
    }

    function addApplianceToArea(areaId, name = '', wattage = 0, quantity = 1) {
        const area = areas.find(a => a.id === areaId);
        if (!area) return; 
        const newAppliance = {
            id: Date.now() + Math.random(), 
            name: name,
            wattage: wattage,
            quantity: quantity
        };
        area.appliances.push(newAppliance);
        
        const areaCard = areasContainer.querySelector(`.area-card[data-area-id="${areaId}"]`);
        if (areaCard) { 
            const tbody = areaCard.querySelector('tbody');
            if (tbody) { 
                 tbody.appendChild(createApplianceRowElement(areaId, newAppliance));
            }
        }
        
        updateAreaSubtotal(areaId);
        calculateTotals();
        saveState();
    }

    function updateAreaSubtotal(areaId) {
        const area = areas.find(a => a.id === areaId);
        if (!area) return; 
        const subtotal = area.appliances.reduce((sum, app) => sum + (app.wattage * app.quantity), 0);
        area.subtotal = subtotal;
        
        const areaCard = areasContainer.querySelector(`.area-card[data-area-id="${areaId}"]`);
        if (areaCard) {
            const subtotalEl = areaCard.querySelector('.area-subtotal');
            if (subtotalEl) {
                subtotalEl.textContent = `${subtotal.toFixed(0)} W`;
            }
        }
    }

    function renderAreas() {
        if (!areasContainer) return; 
        areasContainer.innerHTML = ''; 
        areas.forEach(area => {
            areasContainer.appendChild(createAreaElement(area)); 
        });
    }

    function addNewArea() {
        areaIdCounter++;
        const newArea = {
            id: `area-${Date.now()}-${areaIdCounter}`, 
            name: `Area ${areas.length + 1}`,
            appliances: [],
            subtotal: 0
        };
        areas.push(newArea);
        if (areasContainer) { 
            areasContainer.appendChild(createAreaElement(newArea)); 
        }
        saveState();
    }
    
    if (addAreaBtn) { 
        addAreaBtn.addEventListener('click', addNewArea);
    }


    function calculateTotals() {
        const totalConnectedLoad = areas.reduce((sum, area) => sum + (area.subtotal || 0), 0);
        const diversity = parseFloat(diversityFactorInput.value) || 0.7;
        const maxDemand = totalConnectedLoad * diversity;
        
        const V = parseFloat(voltageInput.value) || 230;
        const PF = parseFloat(powerFactorInput.value) || 0.85;
        const phaseMultiplier = phaseInput.value === "3" ? Math.sqrt(3) : 1;
        
        let current = 0;
        if (V > 0 && PF > 0 && phaseMultiplier > 0) {
             current = maxDemand / (V * PF * phaseMultiplier);
        }

        if (totalConnectedLoadWEl) totalConnectedLoadWEl.textContent = totalConnectedLoad.toFixed(0);
        if (totalConnectedLoadKWEl) totalConnectedLoadKWEl.textContent = (totalConnectedLoad / 1000).toFixed(2);
        if (maxDemandWEl) maxDemandWEl.textContent = maxDemand.toFixed(0);
        if (maxDemandKWEl) maxDemandKWEl.textContent = (maxDemand / 1000).toFixed(2);
        if (calculatedCurrentEl) calculatedCurrentEl.textContent = current.toFixed(2);
    }

    [voltageInput, phaseInput, powerFactorInput, diversityFactorInput].forEach(input => {
        if (input) { 
            input.addEventListener('input', () => {
                calculateTotals();
                saveState(); 
            });
        }
    });

    if (resetBtn) { 
        resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
                localStorage.removeItem('electricalLoadCalcProData');
                areas = [];
                areaIdCounter = 0;
                
                if(projectNameInput) projectNameInput.value = '';
                if(clientNameInput) clientNameInput.value = '';
                if(projectAddressInput) projectAddressInput.value = '';
                if(calcDateInput) calcDateInput.valueAsDate = new Date();
                
                if(voltageInput) voltageInput.value = "230";
                if(phaseInput) phaseInput.value = "1";
                if(powerFactorInput) powerFactorInput.value = "0.85";
                if(diversityFactorInput) diversityFactorInput.value = "0.7";
                
                renderAreas();
                calculateTotals(); 
            }
        });
    }

    if (printBtn) { 
        printBtn.addEventListener('click', generatePrintableInvoice);
    }


    function generatePrintableInvoice() {
        const printContainer = document.getElementById('print-invoice-container');
        if (!printContainer) return;
        
        let html = `<h1>Electrical Load Calculation Summary</h1>`;
        if (calcDateInput) html += `<p><strong>Date:</strong> ${new Date(calcDateInput.value || Date.now()).toLocaleDateString()}</p>`;
        
        if (projectNameInput && projectNameInput.value) html += `<p><strong>Project Name:</strong> ${projectNameInput.value}</p>`;
        if (clientNameInput && clientNameInput.value) html += `<p><strong>Client Name:</strong> ${clientNameInput.value}</p>`;
        if (projectAddressInput && projectAddressInput.value) html += `<p><strong>Project Address:</strong> ${projectAddressInput.value}</p>`;

        html += `<h2>System Parameters</h2>`;
        if (voltageInput) html += `<p><span class="print-summary-label">System Voltage:</span> ${voltageInput.value} V</p>`;
        if (phaseInput) html += `<p><span class="print-summary-label">System Phase:</span> ${phaseInput.options[phaseInput.selectedIndex].text}</p>`;
        if (powerFactorInput) html += `<p><span class="print-summary-label">Assumed Power Factor:</span> ${powerFactorInput.value}</p>`;
        if (diversityFactorInput) html += `<p><span class="print-summary-label">Overall Diversity Factor:</span> ${diversityFactorInput.value}</p>`;
        
        if (areas.length > 0) {
            html += `<h2 class="page-break-before">Load Details by Area</h2>`;
            html += `<table><thead><tr><th>Area</th><th>Appliance</th><th>Wattage (W)</th><th>Qty</th><th>Total (W)</th></tr></thead><tbody>`;
            
            areas.forEach(area => {
                if (area.appliances.length > 0) {
                    html += `<tr class="print-area-name-row"><td colspan="5">${area.name || 'Unnamed Area'}</td></tr>`;
                    area.appliances.forEach(app => {
                        html += `<tr>
                            <td></td>
                            <td>${app.name}</td>
                            <td>${app.wattage}</td>
                            <td>${app.quantity}</td>
                            <td>${(app.wattage * app.quantity).toFixed(0)}</td>
                        </tr>`;
                    });
                    html += `<tr class="print-area-subtotal-row"><td colspan="4">Area Subtotal:</td><td>${(area.subtotal || 0).toFixed(0)} W</td></tr>`;
                }
            });
            html += `</tbody></table>`;
        }

        html += `<h2 class="page-break-before">Calculation Summary</h2>`;
        if (totalConnectedLoadWEl && totalConnectedLoadKWEl) html += `<p><span class="print-summary-label">Total Connected Load:</span> ${totalConnectedLoadWEl.textContent} W / ${totalConnectedLoadKWEl.textContent} kW</p>`;
        if (maxDemandWEl && maxDemandKWEl) html += `<p><span class="print-summary-label">Estimated Maximum Demand (with Diversity):</span> ${maxDemandWEl.textContent} W / ${maxDemandKWEl.textContent} kW</p>`;
        if (calculatedCurrentEl) html += `<p><span class="print-summary-label">Calculated Load Current (at Max Demand):</span> ${calculatedCurrentEl.textContent} Amps</p>`;
        
        html += `<div class="print-footer">
            <p><strong>Important Note:</strong> This calculation is an estimate for planning and preliminary design purposes only. 
            Consult a qualified electrical engineer or licensed electrician for final design, equipment sizing, and compliance with local codes and safety regulations.
            </p>
            <p>Generated by Electrical Load Calculator - Pro on ${new Date().toLocaleString()}</p>
        </div>`;

        printContainer.innerHTML = html;
        window.print();
    }

    function saveState() {
        const projectData = {
            projectName: projectNameInput ? projectNameInput.value : '',
            clientName: clientNameInput ? clientNameInput.value : '',
            projectAddress: projectAddressInput ? projectAddressInput.value : '',
            calcDate: calcDateInput ? calcDateInput.value : '',
            voltage: voltageInput ? voltageInput.value : '230',
            phase: phaseInput ? phaseInput.value : '1',
            powerFactor: powerFactorInput ? powerFactorInput.value : '0.85',
            diversityFactor: diversityFactorInput ? diversityFactorInput.value : '0.7',
            areas: areas,
            areaIdCounter: areaIdCounter
        };
        localStorage.setItem('electricalLoadCalcProData', JSON.stringify(projectData));
    }

    function loadState() {
        const savedData = localStorage.getItem('electricalLoadCalcProData');
        if (savedData) {
            try {
                const projectData = JSON.parse(savedData);
                if(projectNameInput) projectNameInput.value = projectData.projectName || '';
                if(clientNameInput) clientNameInput.value = projectData.clientName || '';
                if(projectAddressInput) projectAddressInput.value = projectData.projectAddress || '';
                if(calcDateInput) calcDateInput.value = projectData.calcDate || new Date().toISOString().split('T')[0];
                
                if(voltageInput) voltageInput.value = projectData.voltage || "230";
                if(phaseInput) phaseInput.value = projectData.phase || "1";
                if(powerFactorInput) powerFactorInput.value = projectData.powerFactor || "0.85";
                if(diversityFactorInput) diversityFactorInput.value = projectData.diversityFactor || "0.7";
                
                areas = projectData.areas || [];
                areaIdCounter = projectData.areaIdCounter || 0;

                renderAreas();
            } catch (e) {
                console.error("Error parsing saved data from localStorage:", e);
                localStorage.removeItem('electricalLoadCalcProData'); // Clear corrupted data
                // Initialize with defaults if parsing fails
                if(calcDateInput) calcDateInput.valueAsDate = new Date();
                 if (areas.length === 0) { 
                    addNewArea(); 
                }
            }
        } else {
            if(calcDateInput) calcDateInput.valueAsDate = new Date();
            if (areas.length === 0) { 
                addNewArea(); 
            }
        }
        calculateTotals(); 
    }
    
    [projectNameInput, clientNameInput, projectAddressInput, calcDateInput].forEach(input => {
        if (input) { 
            input.addEventListener('input', saveState);
        }
    });

    loadState(); 
    console.log("Calculator script (script.js) loaded and DOM ready. If buttons don't work, check for 'Invalid or unexpected token' errors above this message in the console.");
});