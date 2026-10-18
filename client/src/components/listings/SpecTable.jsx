import React from 'react';
import { Cpu, HardDrive, Monitor, Battery, Wrench, ShieldAlert } from 'lucide-react';

export function SpecTable({ listing }) {
  const specs = listing.specifications || {};
  const isLaptop = listing.category === 'laptop';
  const isCamera = listing.category === 'camera';
  const isGaming = listing.category === 'gaming_device';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-between">
        <span>Structured Technical Specifications</span>
        <span className="text-xs font-normal text-slate-500 uppercase tracking-wide">
          {listing.category.replace('_', ' ')}
        </span>
      </div>

      <div className="divide-y divide-slate-100 text-sm">
        {/* Brand & Model */}
        <div className="grid grid-cols-3 px-5 py-2.5">
          <span className="text-slate-500 font-medium">Brand & Model</span>
          <span className="col-span-2 text-slate-900 font-semibold">{listing.brand} {listing.modelName}</span>
        </div>

        {/* Laptop Specific Specs */}
        {isLaptop && (
          <>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" /> Processor (CPU)
              </span>
              <span className="col-span-2 text-slate-900">{specs.cpu || specs.processor || 'Not specified'}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">Installed RAM</span>
              <span className="col-span-2 text-slate-900 font-semibold">{specs.ramGb ? `${specs.ramGb} GB DDR4` : 'Not specified'}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-600" /> Storage Capacity
              </span>
              <span className="col-span-2 text-slate-900">{specs.storageGb ? `${specs.storageGb} GB (${specs.storageType || 'Solid State Drive'})` : 'Not specified'}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-blue-600" /> Display
              </span>
              <span className="col-span-2 text-slate-900">{specs.screenSize || ''} {specs.screenResolution || 'Standard Display'}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5 bg-amber-50/40">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-amber-600" /> Battery Health
              </span>
              <div className="col-span-2">
                {specs.batteryHealthPercent !== null && specs.batteryHealthPercent !== undefined ? (
                  <span className="text-emerald-700 font-bold">{specs.batteryHealthPercent}% Maximum Capacity (Cycles: {specs.batteryCycleCount || 'N/A'})</span>
                ) : (
                  <span className="text-amber-800 font-semibold">
                    NOT DISCLOSED by seller (Unknown condition, not necessarily poor)
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" /> Expandability
              </span>
              <span className="col-span-2 text-slate-900">
                {specs.upgradeableRam ? 'Upgradeable RAM' : 'Soldered RAM'} • {specs.upgradeableStorage ? 'Replaceable SSD' : 'Soldered SSD'}
              </span>
            </div>
          </>
        )}

        {/* Camera Specific Specs */}
        {isCamera && (
          <>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">Sensor Type</span>
              <span className="col-span-2 text-slate-900">{specs.sensorType || 'APS-C / Full-Frame'}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">Resolution</span>
              <span className="col-span-2 text-slate-900 font-semibold">{specs.resolutionMp} Megapixels</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">Shutter Actuations</span>
              <span className="col-span-2 text-slate-900">{specs.shutterCount ? `${specs.shutterCount.toLocaleString()} shutter clicks` : 'Not disclosed'}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">4K Video</span>
              <span className="col-span-2 text-slate-900">{specs.videoRecording4k ? 'Supported' : '1080p Only'}</span>
            </div>
          </>
        )}

        {/* Gaming Console Specific Specs */}
        {isGaming && (
          <>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">Platform</span>
              <span className="col-span-2 text-slate-900 font-semibold">{specs.platform}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">Internal Storage</span>
              <span className="col-span-2 text-slate-900">{specs.storageGb} GB {specs.storageType || 'Custom NVMe'}</span>
            </div>
            <div className="grid grid-cols-3 px-5 py-2.5">
              <span className="text-slate-500 font-medium">Controller</span>
              <span className="col-span-2 text-slate-900">{specs.controllerIncluded ? 'Original controller included' : 'Console only'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
