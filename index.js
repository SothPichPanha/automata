
        // Global variables to store automata
        let currentFA = null;

        // Tab switching functionality
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all nav tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab and mark nav tab as active
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        // Utility functions
        function parseStates(statesStr) {
            return statesStr.split(',').map(s => s.trim()).filter(s => s);
        }

        function parseTransitions(transitionsStr) {
            const transitions = {};
            const lines = transitionsStr.split('\n').filter(line => line.trim());
            
            for (let line of lines) {
                const parts = line.split(',').map(p => p.trim());
                if (parts.length >= 3) {
                    const from = parts[0];
                    const symbol = parts[1];
                    const destinations = parts.slice(2);
                    
                    if (!transitions[from]) transitions[from] = {};
                    if (!transitions[from][symbol]) transitions[from][symbol] = [];
                    transitions[from][symbol] = destinations;
                }
            }
            return transitions;
        }

        // Basic FA Creation
        function createBasicFA() {
            const states = parseStates(document.getElementById('basic-states').value);
            const alphabet = parseStates(document.getElementById('basic-alphabet').value);
            const initial = document.getElementById('basic-initial').value.trim();
            const final = parseStates(document.getElementById('basic-final').value);
            const transitions = parseTransitions(document.getElementById('basic-transitions').value);

            currentFA = { states, alphabet, initial, final, transitions };

            let output = `
                <div class="algorithm-box">
                    <h4>Finite Automaton M = (Q, Σ, δ, q₀, F)</h4>
                    <div class="step"><strong>Q (States):</strong> {${states.join(', ')}}</div>
                    <div class="step"><strong>Σ (Alphabet):</strong> {${alphabet.join(', ')}}</div>
                    <div class="step"><strong>q₀ (Initial State):</strong> ${initial}</div>
                    <div class="step"><strong>F (Final States):</strong> {${final.join(', ')}}</div>
                </div>
                
                <h4>Transition Table:</h4>
                ${generateTransitionTable(states, alphabet, transitions)}
                
                <div class="algorithm-box">
                    <h4>Transition Function δ:</h4>
                    ${generateTransitionFunction(transitions)}
                </div>
            `;

            document.getElementById('basic-output').innerHTML = output;
            document.getElementById('basic-result').style.display = 'block';
        }

        function generateTransitionTable(states, alphabet, transitions) {
            let table = '<table class="transition-table"><thead><tr><th>State</th>';
            alphabet.forEach(symbol => {
                table += `<th>${symbol}</th>`;
            });
            table += '</tr></thead><tbody>';

            states.forEach(state => {
                table += `<tr><td><strong>${state}</strong></td>`;
                alphabet.forEach(symbol => {
                    const dest = transitions[state] && transitions[state][symbol] ? 
                                transitions[state][symbol].join(', ') : '∅';
                    table += `<td>${dest}</td>`;
                });
                table += '</tr>';
            });

            table += '</tbody></table>';
            return table;
        }

        function generateTransitionFunction(transitions) {
            let func = '<pre>';
            for (let state in transitions) {
                for (let symbol in transitions[state]) {
                    func += `δ(${state}, ${symbol}) = {${transitions[state][symbol].join(', ')}}\n`;
                }
            }
            func += '</pre>';
            return func;
        }

        // Deterministic Test
        function testDeterministic() {
            const states = parseStates(document.getElementById('det-states').value);
            const alphabet = parseStates(document.getElementById('det-alphabet').value);
            const transitions = parseTransitions(document.getElementById('det-transitions').value);

            let isDFA = true;
            let nfaReasons = [];
            let algorithm = `
                <div class="algorithm-box">
                    <h4>Algorithm: Determinism Test</h4>
                    <div class="step">1. Check if each state has exactly one transition for each symbol</div>
                    <div class="step">2. Check if there are any ε-transitions (not applicable for this input format)</div>
                    <div class="step">3. Verify completeness of transition function</div>
                </div>
            `;

            // Check determinism
            for (let state of states) {
                for (let symbol of alphabet) {
                    const destinations = transitions[state] && transitions[state][symbol] ? 
                                      transitions[state][symbol] : [];
                    
                    if (destinations.length === 0) {
                        nfaReasons.push(`Missing transition: δ(${state}, ${symbol})`);
                    } else if (destinations.length > 1) {
                        isDFA = false;
                        nfaReasons.push(`Multiple transitions: δ(${state}, ${symbol}) = {${destinations.join(', ')}}`);
                    }
                }
            }

            let result = algorithm + '<div class="algorithm-box">';
            if (isDFA && nfaReasons.length === 0) {
                result += '<h4 class="success">✓ This is a Deterministic Finite Automaton (DFA)</h4>';
                result += '<div class="step">All states have exactly one transition per symbol</div>';
            } else {
                result += '<h4 class="error">✗ This is a Non-deterministic Finite Automaton (NFA)</h4>';
                result += '<div class="step"><strong>Reasons:</strong></div>';
                nfaReasons.forEach(reason => {
                    result += `<div class="step">• ${reason}</div>`;
                });
            }
            result += '</div>';

            document.getElementById('det-output').innerHTML = result;
            document.getElementById('det-result').style.display = 'block';
        }

        // String Testing
        function testString() {
            const states = parseStates(document.getElementById('str-states').value);
            const alphabet = parseStates(document.getElementById('str-alphabet').value);
            const initial = document.getElementById('str-initial').value.trim();
            const final = parseStates(document.getElementById('str-final').value);
            const transitions = parseTransitions(document.getElementById('str-transitions').value);
            const testStr = document.getElementById('test-string').value.trim();

            let algorithm = `
                <div class="algorithm-box">
                    <h4>Algorithm: String Acceptance Test</h4>
                    <div class="step">1. Start from initial state: ${initial}</div>
                    <div class="step">2. Process each symbol in string: "${testStr}"</div>
                    <div class="step">3. Follow transition function δ</div>
                    <div class="step">4. Check if final state is accepting</div>
                </div>
            `;

            let currentStates = [initial];
            let trace = [`Initial state: {${currentStates.join(', ')}}`];

            // Process each symbol
            for (let i = 0; i < testStr.length; i++) {
                const symbol = testStr[i];
                let nextStates = [];

                for (let state of currentStates) {
                    if (transitions[state] && transitions[state][symbol]) {
                        nextStates.push(...transitions[state][symbol]);
                    }
                }

                // Remove duplicates
                nextStates = [...new Set(nextStates)];
                
                if (nextStates.length === 0) {
                    trace.push(`Symbol '${symbol}': No valid transitions - String rejected`);
                    break;
                } else {
                    trace.push(`Symbol '${symbol}': {${currentStates.join(', ')}} → {${nextStates.join(', ')}}`);
                    currentStates = nextStates;
                }
            }

            // Check acceptance
            const accepted = currentStates.some(state => final.includes(state));
            const finalTrace = accepted ? 
                `<div class="success">✓ String "${testStr}" is ACCEPTED</div>` :
                `<div class="error">✗ String "${testStr}" is REJECTED</div>`;

            let result = algorithm + '<div class="algorithm-box"><h4>Execution Trace:</h4>';
            trace.forEach(step => {
                result += `<div class="step">${step}</div>`;
            });
            result += `<div class="step">Final states: {${currentStates.join(', ')}}</div>`;
            result += `<div class="step">Final states ∩ Accepting states: {${currentStates.filter(s => final.includes(s)).join(', ')}}</div>`;
            result += '</div>' + finalTrace;

            document.getElementById('str-output').innerHTML = result;
            document.getElementById('str-result').style.display = 'block';
        }

        // NFA to DFA Conversion
        function convertNFAtoDFA() {
            const nfaStates = parseStates(document.getElementById('nfa-states').value);
            const alphabet = parseStates(document.getElementById('nfa-alphabet').value);
            const nfaInitial = document.getElementById('nfa-initial').value.trim();
            const nfaFinal = parseStates(document.getElementById('nfa-final').value);
            const nfaTransitions = parseTransitions(document.getElementById('nfa-transitions').value);

            let algorithm = `
                <div class="algorithm-box">
                    <h4>Algorithm: Subset Construction (NFA → DFA)</h4>
                    <div class="step">1. Start with initial state as a subset</div>
                    <div class="step">2. For each subset and symbol, compute reachable states</div>
                    <div class="step">3. Create new subsets as needed</div>
                    <div class="step">4. Continue until no new subsets are found</div>
                    <div class="step">5. Final states contain at least one NFA final state</div>
                </div>
            `;

            // Subset construction
            let dfaStates = [];
            let dfaTransitions = {};
            let queue = [[nfaInitial]];
            let processed = new Set();

            dfaStates.push([nfaInitial]);
            let stateCounter = 0;
            let stateMapping = {};
            stateMapping[JSON.stringify([nfaInitial])] = `D${stateCounter++}`;

            let constructionSteps = [`Initial DFA state D0 = {${nfaInitial}}`];

            while (queue.length > 0) {
                const currentSubset = queue.shift();
                const subsetKey = JSON.stringify(currentSubset.sort());
                
                if (processed.has(subsetKey)) continue;
                processed.add(subsetKey);

                const currentDFAState = stateMapping[subsetKey];
                if (!dfaTransitions[currentDFAState]) dfaTransitions[currentDFAState] = {};

                constructionSteps.push(`\nProcessing ${currentDFAState} = {${currentSubset.join(', ')}}:`);

                for (let symbol of alphabet) {
                    let reachableStates = [];
                    
                    for (let nfaState of currentSubset) {
                        if (nfaTransitions[nfaState] && nfaTransitions[nfaState][symbol]) {
                            reachableStates.push(...nfaTransitions[nfaState][symbol]);
                        }
                    }

                    // Remove duplicates and sort
                    reachableStates = [...new Set(reachableStates)].sort();
                    const reachableKey = JSON.stringify(reachableStates);

                    if (reachableStates.length > 0) {
                        if (!stateMapping[reachableKey]) {
                            stateMapping[reachableKey] = `D${stateCounter++}`;
                            dfaStates.push(reachableStates);
                            queue.push(reachableStates);
                            constructionSteps.push(`  New state ${stateMapping[reachableKey]} = {${reachableStates.join(', ')}}`);
                        }
                        
                        dfaTransitions[currentDFAState][symbol] = stateMapping[reachableKey];
                        constructionSteps.push(`  δ(${currentDFAState}, ${symbol}) = ${stateMapping[reachableKey]}`);
                    } else {
                        dfaTransitions[currentDFAState][symbol] = '∅';
                        constructionSteps.push(`  δ(${currentDFAState}, ${symbol}) = ∅`);
                    }
                }
            }

            // DFA final states: any DFA state containing at least one NFA final state
            let dfaFinalStates = [];
            for (let subsetKey in stateMapping) {
                const subset = JSON.parse(subsetKey);
                if (subset.some(s => nfaFinal.includes(s))) {
                    dfaFinalStates.push(stateMapping[subsetKey]);
                }
            }

            // Prepare DFA state names for table
            let dfaStateNames = Object.values(stateMapping);

            // Generate DFA transition table
            let table = '<table class="transition-table"><thead><tr><th>DFA State</th>';
            alphabet.forEach(symbol => {
                table += `<th>${symbol}</th>`;
            });
            table += '</tr></thead><tbody>';

            for (let subsetKey in stateMapping) {
                const dfaState = stateMapping[subsetKey];
                table += `<tr><td><strong>${dfaState}</strong> = {${JSON.parse(subsetKey).join(', ')}}</td>`;
                alphabet.forEach(symbol => {
                    const dest = dfaTransitions[dfaState] && dfaTransitions[dfaState][symbol] ? dfaTransitions[dfaState][symbol] : '∅';
                    table += `<td>${dest}</td>`;
                });
                table += '</tr>';
            }
            table += '</tbody></table>';

            // Output
            let result = algorithm;
            result += `<div class="algorithm-box"><h4>Subset Construction Steps:</h4>`;
            constructionSteps.forEach(step => {
                result += `<div class="step">${step}</div>`;
            });
            result += `</div>`;

            result += `
                <div class="algorithm-box">
                    <h4>DFA States:</h4>
                    <div class="step">{${dfaStateNames.join(', ')}}</div>
                    <h4>DFA Initial State:</h4>
                    <div class="step">${stateMapping[JSON.stringify([nfaInitial])]}</div>
                    <h4>DFA Final States:</h4>
                    <div class="step">{${dfaFinalStates.join(', ')}}</div>
                </div>
                <h4>DFA Transition Table:</h4>
                ${table}
            `;

            document.getElementById('nfa-dfa-output').innerHTML = result;
            document.getElementById('nfa-dfa-result').style.display = 'block';
        }

        // DFA Minimization (Hopcroft's Algorithm)
        function minimizeDFA() {
            const states = parseStates(document.getElementById('min-states').value);
            const alphabet = parseStates(document.getElementById('min-alphabet').value);
            const initial = document.getElementById('min-initial').value.trim();
            const final = parseStates(document.getElementById('min-final').value);
            const transitions = parseTransitions(document.getElementById('min-transitions').value);

            let algorithm = `
                <div class="algorithm-box">
                    <h4>Algorithm: Minimize DFA (Hopcroft's Algorithm)</h4>
                    <div class="step">1. Start with partition P containing all states</div>
                    <div class="step">2. For each input symbol, refine partitions in P</div>
                    <div class="step">3. Repeat until no more refinements are possible</div>
                    <div class="step">4. Create new minimized DFA states from partitions</div>
                    <div class="step">5. Define transitions for minimized DFA</div>
                </div>
            `;

            // Step 1: Initial partition
            let P = [new Set(final), new Set(states.filter(s => !final.includes(s)))];
            let W = new Set(final);

            let constructionSteps = [`Initial partition P: {${[...P[0]].join(', ')}}, {${[...P[1]].join(', ')}}`];

            // Helper function to find and split a set in the partition
            function splitSet(originalSet, symbol) {
                for (let part of P) {
                    if (part.has([...originalSet][0])) {
                        const newPart = new Set([...originalSet].filter(s => transitions[s] && transitions[s][symbol] && part.has(transitions[s][symbol][0])));
                        if (newPart.size > 0 && newPart.size < originalSet.size) {
                            P.push(newPart);
                            constructionSteps.push(`Split ${[...originalSet].join(', ')} by ${symbol}: ${[...newPart].join(', ')}`);
                            return newPart;
                        }
                    }
                }
                return originalSet;
            }

            // Step 2: Refinement
            for (let symbol of alphabet) {
                let newW = new Set();
                for (let A of W) {
                    const X = splitSet(A, symbol);
                    if (X.size > 0 && X.size < A.size) {
                        newW.add(X);
                        newW.add(new Set([...A].filter(s => !X.has(s))));
                    } else {
                        newW.add(A);
                    }
                }
                W = newW;
            }

            // Step 3: Create new states and transitions
            let newStates = [];
            let newTransitions = {};
            let newInitial = null;
            let newFinal = [];

            for (let part of P) {
                const representative = [...part][0];
                newStates.push(representative);
                if (final.includes(representative)) newFinal.push(representative);
                if (representative === initial) newInitial = representative;

                newTransitions[representative] = {};
                for (let symbol of alphabet) {
                    const dest = transitions[representative] && transitions[representative][symbol] ? transitions[representative][symbol] : '∅';
                    newTransitions[representative][symbol] = dest;
                }
            }

            // Output
            let result = algorithm + `<div class="algorithm-box"><h4>Minimized DFA:</h4>`;
            result += `<div class="step">States: {${newStates.join(', ')}}</div>`;
            result += `<div class="step">Initial State: ${newInitial}</div>`;
            result += `<div class="step">Final States: {${newFinal.join(', ')}}</div>`;
            result += `</div><h4>Transition Table:</h4>`;
            result += generateTransitionTable(newStates, alphabet, newTransitions);

            document.getElementById('min-output').innerHTML = result;
            document.getElementById('min-result').style.display = 'block';
        }
