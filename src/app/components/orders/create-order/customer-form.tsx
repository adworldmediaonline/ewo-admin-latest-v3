'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Country, State } from 'country-state-city';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  defaultValues?: Partial<CustomerFormData>;
}

export default function CustomerForm({ onSubmit, defaultValues }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: defaultValues || {
      country: 'US',
    },
  });

  const countries = Country.getAllCountries();
  const defaultCountryCode = defaultValues?.country || 'US';
  const defaultCountry = countries.find(country => country.isoCode === defaultCountryCode);

  // Initialize country from defaultValues
  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry || countries.find(country => country.isoCode === 'US') || null
  );
  const [selectedState, setSelectedState] = useState<{ isoCode: string; name: string } | null>(null);
  const [states, setStates] = useState<Array<{ isoCode: string; name: string }>>([]);
  const [showManualStateInput, setShowManualStateInput] = useState(false);

  // Initialize states for the selected country
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);
    }
  }, [selectedCountry]);

  // Reset form when defaultValues change (e.g., when navigating back)
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);

      // Update country selection
      const country = countries.find(c => c.isoCode === defaultValues.country);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [defaultValues, reset]);

  // Initialize state selection from defaultValues after states are loaded
  useEffect(() => {
    if (defaultValues?.state && states.length > 0 && selectedCountry) {
      const stateValue = defaultValues.state;
      const defaultState = states.find(
        s => s.isoCode === stateValue || s.name === stateValue
      );

      if (defaultState) {
        // State found in list
        setSelectedState(defaultState);
        setValue('state', defaultState.isoCode);
        setShowManualStateInput(false);
      } else {
        // State not in list - treat as manual entry
        setShowManualStateInput(true);
        setValue('state', stateValue);
        setSelectedState(null);
      }
    } else if (defaultValues && !defaultValues.state) {
      // No state value in defaultValues - reset state selection
      setSelectedState(null);
      setShowManualStateInput(false);
    }
  }, [defaultValues?.state, states, selectedCountry, setValue]);

  // Load states when country changes (user-initiated change)
  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.isoCode === countryCode);
    setSelectedCountry(country || null);
    setValue('country', countryCode);

    if (country) {
      const countryStates = State.getStatesOfCountry(country.isoCode);
      setStates(countryStates);

      // Reset state when country changes (unless it's the same country)
      if (selectedCountry?.isoCode !== countryCode) {
        setValue('state', '');
        setSelectedState(null);
        setShowManualStateInput(false);
      }
    }
  };


  const handleStateChange = (stateCode: string) => {
    if (stateCode === '__manual__') {
      setShowManualStateInput(true);
      setValue('state', '');
      setSelectedState(null);
    } else {
      const state = states.find(s => s.isoCode === stateCode);
      setSelectedState(state || null);
      setValue('state', stateCode);
      setShowManualStateInput(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
            placeholder="First Name"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            {...register('lastName', { required: 'Last name is required' })}
            placeholder="Last Name"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contactNo">
          Phone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="contactNo"
          {...register('contactNo', { required: 'Phone is required' })}
          placeholder="Phone"
        />
        {errors.contactNo && (
          <p className="text-sm text-destructive mt-1">{errors.contactNo.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="country">
          Country <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="country"
          control={control}
          rules={{ required: 'Country is required' }}
          render={({ field }) => (
            <Select
              value={field.value || selectedCountry?.isoCode || 'US'}
              onValueChange={value => {
                field.onChange(value);
                handleCountryChange(value);
              }}
            >
              <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {countries.map(country => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.country && (
          <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="min-w-0">
          <Label htmlFor="state">
            State <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="state"
            control={control}
            rules={{ required: 'State is required' }}
            render={({ field }) => {
              if (showManualStateInput) {
                return (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualStateInput(false);
                        setValue('state', '');
                        setSelectedState(null);
                      }}
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      ← Back to state list
                    </button>
                    <Input
                      {...field}
                      placeholder="Enter state name"
                      className={errors.state ? 'border-destructive' : ''}
                    />
                  </div>
                );
              }

              return (
                <Select
                  value={field.value || selectedState?.isoCode || ''}
                  onValueChange={value => {
                    field.onChange(value);
                    handleStateChange(value);
                  }}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger
                    className={`${errors.state ? 'border-destructive' : ''} w-full min-w-0`}
                  >
                    <SelectValue
                      placeholder={selectedCountry ? 'Select State' : 'Select country first'}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {states.length > 0 && (
                      <SelectItem value="__manual__">State not listed? Enter manually</SelectItem>
                    )}
                    {states.map(state => (
                      <SelectItem key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.state && (
            <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
          )}
        </div>

        <div className="min-w-0">
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            {...register('city', { required: 'City is required' })}
            placeholder="City"
            className="min-w-0"
          />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="zipCode">
            ZIP Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="zipCode"
            {...register('zipCode', { required: 'ZIP code is required' })}
            placeholder="ZIP Code"
          />
          {errors.zipCode && (
            <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address">
          Street Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          {...register('address', { required: 'Address is required' })}
          placeholder="House number and street name"
        />
        {errors.address && (
          <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full">
          Continue to Order Summary
        </Button>
      </div>
    </form>
  );
}

