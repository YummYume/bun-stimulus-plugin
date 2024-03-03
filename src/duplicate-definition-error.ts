/**
 * Information about a duplicate definition.
 */
export type DuplicateDefinitionInfo = {
  /**
   * The identifier of the duplicate definition.
   */
  identifier: string;
  /**
   * The name the duplicate definition was going to be assigned to.
   */
  name: string;
  /**
   * The path of the duplicate definition.
   */
  path: string;
};

/**
 * Error thrown when a duplicate definition is found and `duplicateDefinitionHandling` is set to `error`.
 */
export default class DuplicateDefinitionError extends Error {
  /**
   * The existing definition that was found.
   */
  public existingDefinition: DuplicateDefinitionInfo;

  /**
   * The duplicate definition with the same identifier.
   */
  public duplicateDefinition: DuplicateDefinitionInfo;

  constructor(existingDefinition: DuplicateDefinitionInfo, duplicateDefinition: DuplicateDefinitionInfo) {
    super(
      `Duplicate definition found for "${duplicateDefinition.identifier}". Controller with path "${duplicateDefinition.path}" was going to be assigned to "${duplicateDefinition.name}", but it already exists at path "${existingDefinition.path}" with the name "${existingDefinition.name}".`,
    );

    this.existingDefinition = existingDefinition;
    this.duplicateDefinition = duplicateDefinition;
  }
}
