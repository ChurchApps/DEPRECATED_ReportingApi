import scalarCustom from './ScalarCustomResolver'
import { PersonResolver } from './PersonResolver'
import { GroupResolver } from './GroupResolver'
import { HouseholdResolver } from './HouseholdResolver'
import { AttendanceResolver } from './AttendanceResolver'
import { GivingResolver } from './GivingResolver'

export default [
  scalarCustom,
  PersonResolver.getResolver(),
  GroupResolver.getResolver(),
  HouseholdResolver.getResolver(),
  AttendanceResolver.getResolver(),
  GivingResolver.getResolver(),
];