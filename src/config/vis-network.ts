export const primaryColor = '#32A95E' // Main color (online node color)
export const tertiaryColor = '#696969' // nodes offline color
export const secondaryColor = '#F0F2F5' // nodes node background color
export const lightFontColor = '#fff' //The font color at the time of the highlight
export const baseFontSize = 16 // Base font size
export const edgesFontSize = 24 // Edge font size
export const substrLength = 20 //Number of characters
export const showTimes = 10 * 1000 //Highlight seconds

// Online node style
export const onlineStyle = {
  color: {
    background: secondaryColor,
    border: primaryColor,
  },
  font: {
    color: primaryColor,
    size: baseFontSize,
  },
}

// Offline Node Style - Default
export const offlineStyle = {
  color: {
    background: secondaryColor,
    border: tertiaryColor,
  },
  font: {
    color: tertiaryColor,
    size: baseFontSize,
  },
}

export const visOptions = {
  layout: {
    randomSeed: 1,
  },
  physics: {
    barnesHut: {
      springLength: 0, // Reduce the spring length
      springConstant: 0, // Decrease the spring constant
    },
    forceAtlas2Based: {
      springLength: 0, // Reduce the spring length
      springConstant: 0, // Decrease the spring constant
    },
    repulsion: {
      springLength: 0, // Reduce the spring length
      springConstant: 0, // Decrease the spring constant
    },
  },
  nodes: {
    chosen: false,
    mass: 3,
    color: offlineStyle.color,
    font: offlineStyle.font,
    shape: 'box',
    margin: 10,
    borderWidth: 2,
    heightConstraint: 140,
    widthConstraint: 140,
    shadow: {
      enabled: true,
      color: 'rgba(0, 0, 0, .04)',
    },
  },
  edges: {
    width: 2,
    chosen: false,
    color: {
      color: primaryColor,
    },
    arrows: {
      to: {
        enabled: true,
      },
    },
    font: {
      color: primaryColor,
      size: edgesFontSize,
      align: 'top',
    },
    smooth: {
      enabled: true,
      type: 'curvedCW',
      forceDirection: 'vertical',
      roundness: 0.5,
    },
  },
}
