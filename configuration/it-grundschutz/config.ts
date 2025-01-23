export const config = {
  riskAffectedObjectTypes: ['asset', 'process', 'scope'],
  objectDetails: {
    hasRisks: ['asset', 'process', 'scope']
  },
  riEditor: {
    renderedProperties: {
      targetObject: [
        {
          label: 'targetObject',
          key: 'displayName'
        },
        {
          label: 'description',
          key: 'targetObjectDescription'
        }
      ],
      control: [
        {
          label: 'abbreviation',
          key: 'abbreviation'
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
          label: 'originationDescription',
          key: 'originationDescription'
        }
      ]
    }
  }
};
