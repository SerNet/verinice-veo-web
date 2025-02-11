export const config = {
  riskAffectedObjectTypes: ['asset', 'process', 'scope'],
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
