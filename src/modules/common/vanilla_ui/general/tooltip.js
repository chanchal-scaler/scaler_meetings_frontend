const MARGIN = 10;

class VanillaTooltip {
  constructor() {
    this.tooltipContainer = 'vanilla-tooltip-container';
    this.tooltipText = 'vanilla-tooltip-text';
  }

  _getAllNodes = () => {
    const tooltipContainers = document.querySelectorAll(
      `.${this.tooltipContainer}[data-toggle="vanilla-tooltip"]`,
    );
    return tooltipContainers;
  }

  _createTooltip = ({ offsets, tooltipText, placement }) => {
    const div = document.createElement('div');
    div.setAttribute('style', `position: fixed; ${this._positionTooltip({
      placement, offsets,
    })}`);
    div.setAttribute('class', this.tooltipText);
    div.innerHTML = tooltipText;
    return div;
  }

  _positionTooltip = ({ placement, offsets }) => {
    switch (placement) {
      case 'top': {
        return `top: ${offsets.top - (offsets.height + MARGIN)}px; 
        left: ${offsets.left}px`;
      }
      case 'right': {
        return `top: ${offsets.top}px; left: ${offsets.right}px`;
      }
      case 'bottom': {
        return `top: ${offsets.bottom + MARGIN}px; left: ${offsets.left}px`;
      }
      case 'left': {
        return `top: ${offsets.top}px; 
        right: ${window.innerWidth - offsets.left}px`;
      }

      default: return {};
    }
  }

  _initialize = () => {
    this._getAllNodes().forEach((node) => {
      node.addEventListener('mouseover', () => {
        const offsets = node.getBoundingClientRect();
        const [tooltipText, placement] = [
          node.getAttribute('data-title'), node.getAttribute('data-placement'),
        ];
        node.appendChild(this._createTooltip({
          offsets, tooltipText, placement,
        }));
      });
      node.addEventListener('mouseout', () => {
        document.querySelectorAll(`.${this.tooltipText}`).forEach(
          (nodeEl) => { nodeEl.remove(); },
        );
      });
    });
  }
}

function toolTipInit() {
  const toolTipInstance = new VanillaTooltip();
  toolTipInstance._initialize();
}

export default { initialize: toolTipInit };
