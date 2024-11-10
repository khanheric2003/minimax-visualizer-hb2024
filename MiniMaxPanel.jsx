// At the start of your document.addEventListener block, add:
let minimaxPanel = null;

// After your cytoscape initialization, mount the React component:
const minimaxPanelContainer = document.createElement('div');
document.body.appendChild(minimaxPanelContainer);
minimaxPanel = ReactDOM.createRoot(minimaxPanelContainer);
minimaxPanel.render(<MinimaxPanel />);

// Modify your minimax function to track traversal:
function minimax(node, depth, isMaximizingPlayer, alpha = -Infinity, beta = Infinity) {
    console.log(`Minimax at Node ${node.id()} with depth ${depth} and maximizing: ${isMaximizingPlayer}`);
    
    // Add node to history
    minimaxPanel.current.addToHistory(node.id(), nodeList[node.id()].value, isMaximizingPlayer);

    // Base case: if it's a leaf node
    if (node.outgoers('edge').length === 0) {
        let tempValue = Math.floor(Math.random() * 100);
        nodeList[node.id()].value = tempValue;
        return tempValue;
    }

    if (isMaximizingPlayer) {
        let bestValue = -Infinity;
        
        for (let edge of node.outgoers('edge')) {
            let childNode = cy.getElementById(edge.target().id());
            let value = minimax(childNode, depth + 1, false, alpha, beta);
            bestValue = Math.max(bestValue, value);
            alpha = Math.max(alpha, bestValue);
            
            if (beta <= alpha) {
                minimaxPanel.current.addPrunedNode(childNode.id(), value, "α cutoff");
                break;
            }
        }
        
        return bestValue;
    } else {
        let bestValue = Infinity;
        
        for (let edge of node.outgoers('edge')) {
            let childNode = cy.getElementById(edge.target().id());
            let value = minimax(childNode, depth + 1, true, alpha, beta);
            bestValue = Math.min(bestValue, value);
            beta = Math.min(beta, bestValue);
            
            if (beta <= alpha) {
                minimaxPanel.current.addPrunedNode(childNode.id(), value, "β cutoff");
                break;
            }
        }
        
        return bestValue;
    }
}