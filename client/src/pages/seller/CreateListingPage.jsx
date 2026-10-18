import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, AlertCircle, CheckCircle2, Laptop, Camera, Gamepad2, Info } from 'lucide-react';
import { api } from '../../services/api.js';

export function CreateListingPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('laptop');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [generalCondition, setGeneralCondition] = useState('good');
  const [detailedConditionDescription, setDetailedConditionDescription] = useState('');
  const [knownDefects, setKnownDefects] = useState('');
  const [includedAccessories, setIncludedAccessories] = useState('');
  const [sellerOwnershipDeclaration, setSellerOwnershipDeclaration] = useState(false);

  // Category specific specs
  // Laptop
  const [cpu, setCpu] = useState('');
  const [ramGb, setRamGb] = useState('16');
  const [storageGb, setStorageGb] = useState('512');
  const [storageType, setStorageType] = useState('NVMe SSD');
  const [batteryHealthPercent, setBatteryHealthPercent] = useState('');
  const [upgradeableRam, setUpgradeableRam] = useState(true);
  const [upgradeableStorage, setUpgradeableStorage] = useState(true);

  // Camera
  const [resolutionMp, setResolutionMp] = useState('');
  const [shutterCount, setShutterCount] = useState('');
  const [videoRecording4k, setVideoRecording4k] = useState(false);

  // Gaming
  const [platform, setPlatform] = useState('PlayStation 5');
  const [controllerIncluded, setControllerIncluded] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sellerOwnershipDeclaration) {
      alert('You must certify ownership of the device.');
      return;
    }

    setLoading(true);
    setError(null);

    const specifications = {
      ramGb: Number(ramGb) || 0,
      storageGb: Number(storageGb) || 0,
      storageType,
    };

    if (category === 'laptop') {
      specifications.cpu = cpu;
      specifications.processor = cpu;
      specifications.batteryHealthPercent = batteryHealthPercent !== '' ? Number(batteryHealthPercent) : null;
      specifications.upgradeableRam = upgradeableRam;
      specifications.upgradeableStorage = upgradeableStorage;
    } else if (category === 'camera') {
      specifications.resolutionMp = Number(resolutionMp) || 0;
      specifications.shutterCount = shutterCount !== '' ? Number(shutterCount) : null;
      specifications.videoRecording4k = videoRecording4k;
    } else if (category === 'gaming_device') {
      specifications.platform = platform;
      specifications.controllerIncluded = controllerIncluded;
    }

    const payload = {
      category,
      title,
      brand,
      modelName,
      askingPrice: Number(askingPrice),
      generalCondition,
      detailedConditionDescription,
      knownDefects: knownDefects ? knownDefects.split(',').map((s) => s.trim()) : [],
      includedAccessories: includedAccessories ? includedAccessories.split(',').map((s) => s.trim()) : [],
      specifications,
      sellerOwnershipDeclaration,
    };

    try {
      const res = await api.post('/api/listings', payload);
      if (res.success) {
        navigate(`/seller/listings/${res.data._id}/evidence`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">List Preowned Device</h1>
        <p className="text-xs text-slate-500 mt-1">
          Provide structured specs and transparent disclosures. Created listings start as drafts.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="tech-card p-6 space-y-6 text-xs">
        {/* Category Choice */}
        <div>
          <label className="form-label">Device Category</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setCategory('laptop')}
              className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                category === 'laptop' ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Laptop className="w-4 h-4" /> Laptop
            </button>
            <button
              type="button"
              onClick={() => setCategory('camera')}
              className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                category === 'camera' ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-4 h-4" /> Camera
            </button>
            <button
              type="button"
              onClick={() => setCategory('gaming_device')}
              className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                category === 'gaming_device' ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> Gaming Device
            </button>
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Listing Headline / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lenovo ThinkPad T480 - i5 8th Gen, 16GB RAM, 512GB SSD"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Brand</label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Lenovo, Dell, Sony, Apple"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Model Identifier</label>
            <input
              type="text"
              required
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. ThinkPad T480, A6400"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Asking Price (INR ₹)</label>
            <input
              type="number"
              required
              min="1"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="e.g. 42000"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">General Condition Rating</label>
            <select
              value={generalCondition}
              onChange={(e) => setGeneralCondition(e.target.value)}
              className="form-select text-xs"
            >
              <option value="like_new">Like New (Mint / Open Box)</option>
              <option value="excellent">Excellent (Light superficial wear only)</option>
              <option value="good">Good (Normal wear, fully functional)</option>
              <option value="fair">Fair (Visible scuffs / defects disclosed)</option>
            </select>
          </div>
        </div>

        {/* Category-Specific Specifications */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Category Specifications ({category})
          </h3>

          {category === 'laptop' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Processor (CPU)</label>
                <input
                  type="text"
                  value={cpu}
                  onChange={(e) => setCpu(e.target.value)}
                  placeholder="e.g. Intel Core i5-8350U Quad-Core"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label">RAM (GB)</label>
                <input
                  type="number"
                  value={ramGb}
                  onChange={(e) => setRamGb(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label">Storage Capacity (GB)</label>
                <input
                  type="number"
                  value={storageGb}
                  onChange={(e) => setStorageGb(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label">Storage Type</label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                  className="form-select text-xs"
                >
                  <option value="NVMe SSD">NVMe SSD (Ultra Fast)</option>
                  <option value="SATA SSD">SATA SSD</option>
                  <option value="HDD">Mechanical HDD</option>
                </select>
              </div>

              <div className="md:col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Info className="w-4 h-4 text-amber-600" /> Battery Health Disclosure (Voluntary)
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  If unknown or unmeasured, leave blank. The AI and comparison matrix will clearly state it is <em>"unknown, not necessarily poor"</em>.
                </p>
                <div className="w-48">
                  <label className="form-label">Battery Health (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={batteryHealthPercent}
                    onChange={(e) => setBatteryHealthPercent(e.target.value)}
                    placeholder="Leave empty if omitted"
                    className="form-input text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {category === 'camera' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Resolution (Megapixels)</label>
                <input
                  type="number"
                  value={resolutionMp}
                  onChange={(e) => setResolutionMp(e.target.value)}
                  placeholder="e.g. 24"
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label">Shutter Actuation Count (If Known)</label>
                <input
                  type="number"
                  value={shutterCount}
                  onChange={(e) => setShutterCount(e.target.value)}
                  placeholder="e.g. 4800"
                  className="form-input text-xs"
                />
              </div>
            </div>
          )}

          {category === 'gaming_device' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Console Platform</label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="e.g. PlayStation 5, Xbox Series X, Switch"
                  className="form-input text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="ctrl"
                  checked={controllerIncluded}
                  onChange={(e) => setControllerIncluded(e.target.checked)}
                  className="accent-blue-600"
                />
                <label htmlFor="ctrl" className="text-slate-800 font-semibold cursor-pointer">
                  Original Controller Included
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Condition Disclosures & Known Defects */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Condition Disclosures & Transparency
          </h3>

          <div>
            <label className="form-label">Detailed Condition Notes</label>
            <textarea
              required
              rows="3"
              value={detailedConditionDescription}
              onChange={(e) => setDetailedConditionDescription(e.target.value)}
              placeholder="Describe physical cosmetic condition, keyboard feel, scratches, and usage history..."
              className="form-textarea text-xs"
            />
          </div>

          <div>
            <label className="form-label">Known Defects / Flaws (Comma separated)</label>
            <input
              type="text"
              value={knownDefects}
              onChange={(e) => setKnownDefects(e.target.value)}
              placeholder="e.g. Minor lid scratch, Left USB port loose"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label">Included Accessories (Comma separated)</label>
            <input
              type="text"
              value={includedAccessories}
              onChange={(e) => setIncludedAccessories(e.target.value)}
              placeholder="e.g. Original 65W charger, Carrying case, HDMI cable"
              className="form-input text-xs"
            />
          </div>
        </div>

        {/* Ownership Certification */}
        <div className="border-t border-slate-100 pt-4">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={sellerOwnershipDeclaration}
              onChange={(e) => setSellerOwnershipDeclaration(e.target.checked)}
              className="accent-blue-600 mt-0.5"
            />
            <span className="text-[11px] text-slate-600 leading-relaxed">
              I legally certify that I am the legitimate owner of this hardware device and all provided specifications and condition disclosures are accurate to the best of my knowledge.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary text-xs py-2.5 px-6 font-bold shadow-sm"
          >
            {loading ? 'Creating Listing...' : 'Save Draft & Proceed to Evidence'}
          </button>
        </div>
      </form>
    </div>
  );
}
