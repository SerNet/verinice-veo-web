export const config = {
  riskAffectedObjectTypes: ['process', 'scope', 'asset'],
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
          label: 'designator',
          key: 'designator'
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
