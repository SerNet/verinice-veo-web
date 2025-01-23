export const config = {
  riskAffectedObjectTypes: ['asset', 'process', 'scope'],
  objectDetails: {
    hasRisks: ['asset', 'process', 'scope']
  },
  riEditor: {
    renderedProperties: {
      targetObject: [
        {
          label: 'riskAffected',
          key: 'displayName'
        },
        {
          label: 'name',
          key: 'name'
        },
        {
          label: 'id',
          key: 'id'
        }
      ],
      control: [
        {
          label: 'abbreviation',
          key: 'abbreviation'
        },
        {
          label: 'designator',
          key: 'designator'
        },
        {
          label: 'protectionApproach',
          key: 'protectionApproachTranslation'
        },
        {
          label: 'name',
          key: 'name'
        },
        {
          label: 'origination',
          key: 'origination'
        }
      ]
    }
  }
};
