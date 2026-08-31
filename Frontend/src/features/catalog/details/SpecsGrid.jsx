import { formatDate, formatMileage } from "../../../shared/utils/format.js";
import {
  CalendarIcon,
  GaugeIcon,
  FuelIcon,
  GearIcon,
  SteeringWheelIcon,
  EngineIcon,
} from "../../../shared/components/icons.jsx";

const SpecCell = ({ icon: Icon, label, value }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-card">
      <span className="flex items-center gap-2 text-ash text-xs uppercase tracking-wider">
        {Icon && <Icon className="w-4 h-4 text-brass-dark shrink-0" />}
        {label}
      </span>
      <span className="text-bone text-sm font-mono text-right">{value}</span>
    </div>
  );
};

export const SpecsGrid = ({ car }) => (
  <div className="grid sm:grid-cols-2 gap-x-10">
    <div>
      <SpecCell label="Brand" value={car.brand} />
      <SpecCell label="Model" value={car.model} />
      <SpecCell icon={CalendarIcon} label="Year" value={car.year} />
      <SpecCell label="Condition" value={car.condition} />
      <SpecCell label="Color" value={car.color} />
      <SpecCell icon={GaugeIcon} label="Mileage" value={formatMileage(car.mileage)} />
    </div>
    <div>
      <SpecCell icon={FuelIcon} label="Fuel Type" value={car.fuelType} />
      <SpecCell label="Body Type" value={car.bodyType} />
      <SpecCell icon={GearIcon} label="Transmission" value={car.transmission} />
      <SpecCell icon={SteeringWheelIcon} label="Steering" value={car.steeringType} />
      <SpecCell icon={EngineIcon} label="Engine" value={car.engineCC ? `${car.engineCC} cc` : null} />
      <SpecCell icon={CalendarIcon} label="Imported" value={formatDate(car.importedDate)} />
    </div>
  </div>
);
