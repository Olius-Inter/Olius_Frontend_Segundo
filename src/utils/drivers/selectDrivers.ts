import type { Driver } from '../../types/drivers/driver'
import type { DriverListFilters } from '../../types/drivers/driverList'
import { normalizeDriverSearch } from './driverListPreferences'

export function selectDrivers(drivers: Driver[], filters: DriverListFilters): Driver[] {
  const query = normalizeDriverSearch(filters.name)
  return drivers
    .filter(
      (driver) =>
        (filters.status === 'ALL' || driver.status === filters.status) &&
        normalizeDriverSearch(driver.name).includes(query),
    )
    .sort((left, right) => {
      const comparison =
        left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' }) ||
        left.id.localeCompare(right.id)
      return filters.sort === 'name-desc' ? -comparison : comparison
    })
}
