import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Input, Select, Textarea } from "../../../shared/components/Input.jsx";

import { Button } from "../../../shared/components/Button.jsx";

import { ImageUploader } from "../../../shared/components/ImageUploader.jsx";

import { useToast } from "../../../store/ui/ToastContext.jsx";

import { useCarOptions } from "../../../shared/hooks/useCarOptions.js";

import {
  validateCarForm,
  hasErrors,
} from "../../../shared/utils/validators.js";

import { parseApiError } from "../../../services/api/client.js";

import { createCar } from "../../../services/cars/carsApi.js";

const INITIAL_FORM = {
  title: "",
  brand: "",
  model: "",
  year: "",
  price: "",
  province: "",
  city: "",
  steeringType: "",
  mileage: "",
  fuelType: "",
  bodyType: "",
  transmission: "",
  condition: "",
  engineCC: "",
  color: "",
  description: "",
  importedDate: "",
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    options,
    loading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = useCarOptions();

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateCarForm(form);

    setFieldErrors(errors);
    setFormError(null);

    if (hasErrors(errors)) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);

    try {
      const car = await createCar(form, images);

      toast.success(
        `"${car.title}" listed successfully. Pictures uploaded successfully.`,
      );

      navigate("/admin/listings");
    } catch (err) {
      const parsed = parseApiError(err);

      setFormError(
        parsed.errors.length ? parsed.errors : [parsed.message],
      );

      toast.error(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-8 sm:py-10 max-w-3xl">
      <p className="font-mono text-xs text-brass uppercase tracking-widest mb-2">
        Inventory
      </p>

      <h1 className="font-display text-4xl font-semibold text-bone mb-8">
        Create Listing
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-8"
      >
        {formError && (
          <div
            role="alert"
            className="bg-danger/8 border border-danger/25 rounded-xl px-4 py-3 space-y-1"
          >
            {formError.map((msg, i) => (
              <p key={i} className="text-danger text-sm">
                {msg}
              </p>
            ))}
          </div>
        )}

        {optionsError && (
          <div
            role="alert"
            className="bg-danger/8 border border-danger/25 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <p className="text-danger text-sm">
              Couldn't load dropdown options (brand, province, engine, year).
            </p>
            <button
              type="button"
              onClick={refetchOptions}
              className="text-danger text-sm font-semibold underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* ==================== CORE DETAILS ==================== */}

        <section className="glass-panel rounded-premium-lg p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-bone">
            Core Details
          </h2>

          <Input
            label="Title"
            required
            placeholder="e.g. 2020 Toyota Corolla Altis"
            value={form.title}
            onChange={updateField("title")}
            error={fieldErrors.title}
          />

          <div className="grid sm:grid-cols-2 gap-4">

            {/* BRAND DROPDOWN */}
            <Select
              label="Brand"
              required
              value={form.brand}
              onChange={updateField("brand")}
              error={fieldErrors.brand}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? "Loading brands…" : "Select brand"}
              </option>
              {(options?.brands ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>

            <Input
              label="Model"
              required
              placeholder="Corolla"
              value={form.model}
              onChange={updateField("model")}
              error={fieldErrors.model}
            />

          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* YEAR DROPDOWN */}
            <Select
              label="Year"
              required
              value={form.year}
              onChange={updateField("year")}
              error={fieldErrors.year}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? "Loading years…" : "Select year"}
              </option>
              {(options?.years ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>

            <Input
              label="Price"
              type="number"
              required
              placeholder="1500000"
              value={form.price}
              onChange={updateField("price")}
              error={fieldErrors.price}
            />
          </div>

          <Select
            label="Steering Type"
            required
            value={form.steeringType}
            onChange={updateField("steeringType")}
            error={fieldErrors.steeringType}
          >
            <option value="">Select steering type</option>

            {(options?.steering ?? []).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </section>

        {/* ==================== LOCATION ==================== */}

        <section className="glass-panel rounded-premium-lg p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-bone">
            Location
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">

            {/* PROVINCE DROPDOWN */}
            <Select
              label="Province"
              required
              value={form.province}
              onChange={updateField("province")}
              error={fieldErrors.province}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? "Loading provinces…" : "Select province"}
              </option>
              {(options?.provinces ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>

            <Input
              label="City"
              placeholder="Jalalabad"
              value={form.city}
              onChange={updateField("city")}
            />

          </div>
        </section>

        {/* ==================== SPECIFICATIONS ==================== */}

        <section className="glass-panel rounded-premium-lg p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-bone">
            Specifications
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">

            <Input
              label="Mileage (km)"
              type="number"
              placeholder="30000"
              value={form.mileage}
              onChange={updateField("mileage")}
              error={fieldErrors.mileage}
            />

            {/* ENGINE DROPDOWN */}
            <Select
              label="Engine (cc)"
              value={form.engineCC}
              onChange={updateField("engineCC")}
              error={fieldErrors.engineCC}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? "Loading engine sizes…" : "Select engine"}
              </option>
              {(options?.engineCC ?? []).map((v) => (
                <option key={v} value={v}>
                  {v} cc
                </option>
              ))}
            </Select>

          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Fuel Type"
              value={form.fuelType}
              onChange={updateField("fuelType")}
            >
              <option value="">Select fuel type</option>

              {(options?.fuelTypes ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>

            <Select
              label="Body Type"
              value={form.bodyType}
              onChange={updateField("bodyType")}
            >
              <option value="">Select body type</option>

              {(options?.bodyTypes ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Transmission"
              value={form.transmission}
              onChange={updateField("transmission")}
            >
              <option value="">Select transmission</option>

              {(options?.transmissions ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>

            <Select
              label="Condition"
              value={form.condition}
              onChange={updateField("condition")}
            >
              <option value="">Select condition</option>

              {(options?.conditions ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Color"
              placeholder="White"
              value={form.color}
              onChange={updateField("color")}
            />

            <Input
              label="Imported Date"
              type="date"
              value={form.importedDate}
              onChange={updateField("importedDate")}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Condition notes, service history, ownership details…"
            value={form.description}
            onChange={updateField("description")}
            error={fieldErrors.description}
            hint={`${form.description.length} / 2000`}
          />
        </section>

        {/* ==================== IMAGES ==================== */}

        <section className="glass-panel rounded-premium-lg p-5 sm:p-6">
          <ImageUploader
            files={images}
            onChange={setImages}
          />
        </section>

        {/* ==================== ACTIONS ==================== */}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
          >
            Publish Listing
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/listings")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
