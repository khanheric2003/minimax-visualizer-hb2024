document.addEventListener('DOMContentLoaded', function() {
  // Create a custom node class for linked list structure
  class LinkedNode {
    constructor(id) {
      this.id = id; // Node identifier
      this.children = []; // List of child nodes
      this.value = null; // Value for the node
    }

    addChild(node) {
      this.children.push(node); // Add a child to the node
    }
  }

  // Initialize Cytoscape
  var cy = cytoscape({
    container: document.getElementById('cy'),

    elements: [
      // Existing nodes
      { data: { id: 'a' } },
      { data: { id: 'b' } },
      { data: { id: 'c' } },
      { data: { id: 'd' } },
      { data: { id: 'e' } },
      { data: { id: 'f' } },
      { data: { id: 'g' } },
    
      // New nodes in the added row
      { data: { id: 'h' } },
      { data: { id: 'i' } },
      { data: { id: 'j' } },
      { data: { id: 'k' } },
      { data: { id: 'l' } },
      { data: { id: 'm' } },
    
      // Existing edges (connections)
      { data: { source: 'a', target: 'b' } },
      { data: { source: 'a', target: 'c' } },
      { data: { source: 'b', target: 'd' } },
      { data: { source: 'b', target: 'e' } },
      { data: { source: 'c', target: 'f' } },
      { data: { source: 'c', target: 'g' } },
    
      // New edges (connecting the new nodes)
      { data: { source: 'b', target: 'h' } },
      { data: { source: 'b', target: 'i' } },
      { data: { source: 'd', target: 'j' } },
      { data: { source: 'e', target: 'k' } },
      { data: { source: 'f', target: 'l' } },
      { data: { source: 'g', target: 'm' } },
    ],

    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#0074D9',
          'label': 'data(value)',  // Show value as label for nodes
          'shape': 'ellipse',
          'width': '40px',
          'height': '40px',
          'text-valign': 'center',
          'color': '#ffffff',
          'font-size': '12px',
          'text-outline-color': '#0074D9',
          'text-outline-width': 2
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
        }
      }
    ],

    layout: {
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 1.5,
      padding: 20,
      avoidOverlap: true
    }
  });

  // Initialize nodes with linked list structure
  let nodeList = {}; // Stores nodes by their IDs

  cy.nodes().forEach(node => {
    let linkedNode = new LinkedNode(node.id());
    nodeList[node.id()] = linkedNode; // Store node in the nodeList

    if (node.outgoers('edge').length === 0) {
      linkedNode.value = Math.floor(Math.random() * 100); // Assign random value to leaf nodes
      node.data('value', linkedNode.value);  // Update value to show on label
      console.log(`Leaf Node ${node.id()}: Initial Value = ${linkedNode.value}`);
    } else {
      linkedNode.value = null; // Non-leaf nodes have a value of null initially
      node.data('value', '');  // Empty label for non-leaf nodes
      console.log(`Non-leaf Node ${node.id()}: Initial Value = ${linkedNode.value}`);
    }
  });

  // Function to propagate values from leaf to parent
  function propagateValues() {
    cy.nodes().forEach(node => {
      if (node.outgoers('edge').length > 0) {
        let linkedNode = nodeList[node.id()]; // Get the linked node
        let childrenValues = linkedNode.children.map(child => child.value); // Get values from child nodes
        let newValue = childrenValues.reduce((acc, value) => acc + value, 0); // Sum of child values
        linkedNode.value = newValue;

        node.data('value', newValue); // Update node's value to propagate to the label

        console.log(`Non-leaf Node ${node.id()}: Propagating Value = ${newValue}`);
      }
    });
  }

  // Function to add buttons next to each node
  function addButtons() {
    document.querySelectorAll('.control-button').forEach(btn => btn.remove()); // Clear existing buttons

    cy.nodes().forEach(node => {
      let pos = node.renderedPosition();
      let container = document.getElementById('cy-container');

      let addButton = document.createElement('button');
      addButton.textContent = '+';
      addButton.style.position = 'absolute';
      addButton.style.left = `${pos.x + 10}px`;
      addButton.style.top = `${pos.y - 10}px`;
      addButton.classList.add('control-button');

      let removeButton = document.createElement('button');
      removeButton.textContent = '-';
      removeButton.style.position = 'absolute';
      removeButton.style.left = `${pos.x + 40}px`;
      removeButton.style.top = `${pos.y - 10}px`;
      removeButton.classList.add('control-button');

      container.appendChild(addButton);
      container.appendChild(removeButton);

      // Event listener for adding child nodes
      addButton.addEventListener('click', () => {
        let newId = 'new' + Math.floor(Math.random() * 1000); // Unique ID for new nodes
        cy.add([ 
          { data: { id: newId } },
          { data: { source: node.id(), target: newId } }
        ]);
        let newNode = new LinkedNode(newId);
        nodeList[newId] = newNode; // Add the new node to the node list

        // Link the new node as a child of the current node
        let linkedNode = nodeList[node.id()];
        linkedNode.addChild(newNode); // Add new node as a child

        cy.layout({ name: 'breadthfirst', directed: true, spacingFactor: 1.5 }).run();
        addButtons(); // Refresh buttons
        propagateValues(); // Propagate values after adding a new node
      });

      // Event listener for removing the node
      removeButton.addEventListener('click', () => {
        node.remove();
        delete nodeList[node.id()]; // Remove the node from the node list
        cy.layout({ name: 'breadthfirst', directed: true, spacingFactor: 1.5 }).run();
        addButtons(); // Refresh buttons
        propagateValues(); // Propagate values after removing a node
      });
    });
  }

  function minimax(node, depth, isMaximizingPlayer) {
    console.log(`Minimax at Node ${node.id()} with depth ${depth} and maximizing: ${isMaximizingPlayer}`);

    // Base case: if it's a leaf node
    if (node.outgoers('edge').length === 0) {
      let tempValue = Math.floor(Math.random() * 100); // Temporary integer for leaf nodes
      nodeList[node.id()].value = tempValue; // Assign a random value to leaf nodes
      console.log(`Leaf Node ${node.id()}: Value = ${tempValue}`);
      return tempValue; // Return the value of the leaf node
    }

    if (isMaximizingPlayer) {
      let bestValue = -Infinity;

      node.outgoers('edge').forEach(edge => {
        let childNode = cy.getElementById(edge.target().id());
        let value = minimax(childNode, depth + 1, false);
        bestValue = Math.max(bestValue, value);
      });

      console.log(`Maximizing: Node ${node.id()} Value = ${bestValue}`);
      return bestValue;
    } else {
      let bestValue = Infinity;

      node.outgoers('edge').forEach(edge => {
        let childNode = cy.getElementById(edge.target().id());
        let value = minimax(childNode, depth + 1, true);
        bestValue = Math.min(bestValue, value);
      });

      console.log(`Minimizing: Node ${node.id()} Value = ${bestValue}`);
      return bestValue;
    }
  }

  // Function to run minimax when the button is pressed
  document.getElementById('run-button').addEventListener('click', function() {
    let rootNode = cy.getElementById('a'); // Get the Cytoscape node by ID
    let result = minimax(rootNode, 0, true);
    console.log('Minimax Result:', result);
  });

  // Initial button placement and value propagation
  cy.on('render', function() {
    addButtons();
    propagateValues(); // Initial propagation to fill values
  });
});
