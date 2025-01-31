export const config = {
  riskAffectedObjectTypes: ['asset', 'process', 'scope'],
  domains: {
    colors: {
      'ds-gvo': '#c90000',
      'iso-iec-27000': '#003f63',
      nis2: '#9c26af',
      'it-grundschutz': '#4baf50',
      default: '',
      'itgs++': '#009192',
      tisax: '#f48e19',
      bcm: '#cc338b'
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
