export const config = {
  riskAffectedObjectTypes: ['asset', 'process', 'scope'],
  domains: {
    colors: {
      'ds-gvo': '#c90000',
      'iso-iec-27000': '#003f63', // This domain name is deprecated (ISO/IEC 27000)
      'iso-27001-de': '#003f63',
      nis2: '#9c26af',
      'it-grundschutz': '#2E7D32',
      'it-grundschutz++': '#009192',
      tisax: '#AF6108',
      'business-continuity-management': '#cc338b',
      default: ''
    }
  },

  riEditor: {
    renderedProperties: {
      targetObject: [
        {
          label: 'targetObject',
          key: 'displayName'
        },
        {
          label: 'name',
          key: 'name'
        }
      ],
      control: [
        {
          label: 'abbreviation',
          key: 'abbreviation'
        },
        {
          label: 'name',
          key: 'name'
        }
      ]
    }
  }
};
