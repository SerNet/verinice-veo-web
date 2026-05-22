const flagNames = {
  graph: 'VEO_FEATURE_FLAG_GRAPH',
  userSettings: 'VEO_FEATURE_FLAG_USER_SETTINGS',
  shortcuts: 'VEO_FEATURE_FLAG_SHORTCUTS',
  accessGroups: 'VEO_FEATURE_FLAG_ACCESS_GROUPS',
  unitImport: 'VEO_FEATURE_FLAG_UNIT_IMPORT',
  riDialogProps: 'VEO_FEATURE_FLAG_RI_DIALOG_ADDITIONAL_PROPERTIES'
};

type FlagNames = keyof typeof flagNames;
export type FeatureFlags = Record<FlagNames, string>;

export function hasFeature(flagName: FlagNames): boolean {
  const config = useRuntimeConfig();
  const flags = config.public?.featureFlags || {};
  return flags?.[flagName] === 'true';
}

/**
 * Assing feature flags based on environment variables and `flagNames`.
 * If a flag from `flagNames` is not set in the environment, it will default to a string suffixed with `_EXAMPLE`.
 */
export function createFeatureFlags(env: NodeJS.ProcessEnv | undefined, flags = flagNames): FeatureFlags {
  return Object.keys(flags).reduce((featureFlags, flagName) => {
    const envVarName = flags[flagName];
    const envVarValue = env?.[envVarName] ? env[envVarName] : `${flags[flagName]}_EXAMPLE`;

    return {
      ...featureFlags,
      [flagName]: envVarValue
    };
  }, {} as FeatureFlags);
}
