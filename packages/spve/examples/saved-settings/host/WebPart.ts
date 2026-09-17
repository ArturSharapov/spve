import { Version } from '@microsoft/sp-core-library'
import Base from 'spve/host'

export default class WebPart extends Base {
  protected get dataVersion(): Version {
    return Version.parse('2.0')
  }

  protected onAfterDeserialize(
    properties: unknown,
    storedVersion: Version,
  ): Record<string, unknown> {
    if (Version.compare(storedVersion, this.dataVersion) > 0) {
      throw new Error(`Saved settings version ${storedVersion} is newer than supported version 2.0`)
    }
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
      throw new Error(`Expected a property object for saved settings version ${storedVersion}`)
    }
    const next: Record<string, unknown> = { ...properties }
    if (Version.compare(storedVersion, Version.parse('2.0')) < 0) {
      if (typeof next.listId !== 'string' || !next.listId.trim()) {
        throw new Error(
          `Cannot migrate listId from saved settings version ${storedVersion}: expected a nonempty string`,
        )
      }
      next.listIds = [next.listId]
      delete next.listId
    }
    if (
      !Array.isArray(next.listIds) ||
      next.listIds.some((value) => typeof value !== 'string' || !value.trim())
    ) {
      throw new Error(
        'Invalid listIds in saved settings version 2.0: expected an array of nonempty strings',
      )
    }
    return next
  }
}
