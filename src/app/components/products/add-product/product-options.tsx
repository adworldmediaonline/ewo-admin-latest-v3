import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';
import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';

interface OptionData {
  title: string;
  price: number | string;
}

type IPropType = {
  setOptions: React.Dispatch<
    SetStateAction<
      {
        title: string;
        price: number;
      }[]
    >
  >;
  default_value?: OptionData[];
  isSubmitted?: boolean;
};

// Enhanced OptionData interface with validation
interface EnhancedOptionData extends OptionData {
  isValid: boolean;
  hasError: boolean;
  titleError: string;
  priceError: string;
}

export default function ProductOptions({
  setOptions,
  default_value,
  isSubmitted,
}: IPropType) {
  const [formData, setFormData] = useState<EnhancedOptionData[]>(
    default_value && default_value.length > 0
      ? default_value.map(item => ({
          ...item,
          isValid: true,
          hasError: false,
          titleError: '',
          priceError: '',
        }))
      : [
          {
            title: '',
            price: '',
            isValid: true,
            hasError: false,
            titleError: '',
            priceError: '',
          },
        ]
  );
  const [hasDefaultValues, setHasDefaultValues] = useState<boolean>(false);

  // Validation functions
  const validateTitle = (title: string): string => {
    if (!title.trim()) return 'Option title is required';
    if (title.trim().length < 2) return 'Title must be at least 2 characters';
    if (title.trim().length > 50)
      return 'Title must be less than 50 characters';
    return '';
  };

  const validatePrice = (price: string | number): string => {
    if (price === '' || price === null || price === undefined) return '';

    const numPrice =
      typeof price === 'number' ? price : parseFloat(price.toString());

    if (isNaN(numPrice)) return 'Please enter a valid price';
    if (numPrice < 0) return 'Price cannot be negative';
    if (numPrice > 99999) return 'Price cannot exceed $99,999';
    return '';
  };

  // Format a price from number to string with 2 decimal places if needed
  const formatPriceForDisplay = (price: number | string): string => {
    if (price === '') return '';

    // Parse the price as a number
    const numPrice =
      typeof price === 'number' ? price : parseFloat(price as string);

    // Return empty string for NaN values
    if (isNaN(numPrice)) return '';

    // Convert to string, keeping decimals only if needed
    return numPrice.toString();
  };

  // Convert a price from any format to a valid number
  const parsePrice = (price: number | string): number => {
    if (price === '') return 0;
    if (typeof price === 'number') return price;

    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  };

  // default value set
  useEffect(() => {
    if (default_value && !hasDefaultValues) {
      const processedValues =
        default_value.length > 0
          ? default_value.map(item => ({
              ...item,
              price: parsePrice(item.price),
            }))
          : [];

      setOptions(processedValues);
      setHasDefaultValues(true);
    }
  }, [default_value, hasDefaultValues, setOptions]);

  // handle change field with validation
  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = [...formData];
    const currentItem = updatedFormData[index];

    // For price input, validate that it's a valid number format
    if (name === 'price') {
      // Allow empty string, numbers, and numbers with decimals only
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        updatedFormData[index] = {
          ...currentItem,
          [name]: value,
        };
      }
    } else {
      updatedFormData[index] = {
        ...currentItem,
        [name]: value,
      };
    }

    // Validate the updated item
    const titleError = validateTitle(updatedFormData[index].title);
    const priceError = validatePrice(updatedFormData[index].price);

    updatedFormData[index] = {
      ...updatedFormData[index],
      titleError,
      priceError,
      hasError: !!(titleError || priceError),
      isValid: !titleError && !priceError,
    };

    setFormData(updatedFormData);

    // Convert price to number when sending to parent (only valid items)
    const validDataForParent = updatedFormData
      .filter(item => item.title.trim() && !item.hasError)
      .map(item => ({
        title: item.title.trim(),
        price: parsePrice(item.price),
      }));

    setOptions(validDataForParent);
  };

  // handle add field with validation
  const handleAddField = () => {
    // Safety check to ensure formData is not empty
    if (formData.length === 0) {
      const newData = [
        {
          title: '',
          price: '',
          isValid: true,
          hasError: false,
          titleError: '',
          priceError: '',
        },
      ];
      setFormData(newData);
      setOptions([]);
      return;
    }

    const lastField = formData[formData.length - 1];

    // Check if last field is valid and has a title
    if (lastField && lastField.title.trim() !== '' && !lastField.hasError) {
      const newField = {
        title: '',
        price: '',
        isValid: true,
        hasError: false,
        titleError: '',
        priceError: '',
      };

      setFormData([...formData, newField]);
    }
  };

  // handleRemoveField with validation
  const handleRemoveField = (index: number) => {
    const updatedFormData = [...formData];
    updatedFormData.splice(index, 1);

    // Ensure there's always at least one form field
    if (updatedFormData.length === 0) {
      updatedFormData.push({
        title: '',
        price: '',
        isValid: true,
        hasError: false,
        titleError: '',
        priceError: '',
      });
    }

    setFormData(updatedFormData);

    // Convert price to number when sending to parent (only valid items)
    const validDataForParent = updatedFormData
      .filter(item => item.title.trim() && !item.hasError)
      .map(item => ({
        title: item.title.trim(),
        price: parsePrice(item.price),
      }));

    setOptions(validDataForParent);
  };

  // Reset form when isSubmitted changes
  useEffect(() => {
    if (isSubmitted) {
      setFormData([
        {
          title: '',
          price: '',
          isValid: true,
          hasError: false,
          titleError: '',
          priceError: '',
        },
      ]);
    }
  }, [isSubmitted]);

  const validOptionsCount = formData.filter(
    item => item.title.trim() && !item.hasError
  ).length;
  const hasErrors = formData.some(item => item.hasError);

  return (
    <div className="space-y-6">
      {/* Options Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Settings className="h-3 w-3" />
            {validOptionsCount} option{validOptionsCount !== 1 ? 's' : ''}
          </Badge>
          {hasErrors && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Has errors
            </Badge>
          )}
        </div>
        <Button
          type="button"
          onClick={handleAddField}
          className="gap-2"
          disabled={
            formData.length > 0 && formData[formData.length - 1].hasError
          }
        >
          <Plus className="h-4 w-4" />
          Add Option
        </Button>
      </div>

      {/* Options List */}
      <div className="space-y-4">
        {formData.map((data, index) => {
          const canRemove = formData.length > 1;

          return (
            <div
              key={index}
              className={cn(
                'relative p-4 rounded-lg border transition-all duration-200',
                data.hasError
                  ? 'border-destructive/50 bg-destructive/5'
                  : data.isValid && data.title.trim()
                  ? 'border-green-500/50 bg-green-50/50'
                  : 'border-muted hover:border-primary/50'
              )}
            >
              {/* Option Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Option {index + 1}
                  </span>
                  {data.isValid && data.title.trim() && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {data.hasError && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>

                {canRemove && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveField(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor={`title-${index}`}
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    Option Title
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id={`title-${index}`}
                      type="text"
                      name="title"
                      placeholder="e.g. Small, Medium, Large, Red, Blue"
                      value={data.title}
                      onChange={e => handleChange(index, e)}
                      className={cn(
                        'transition-all duration-200',
                        data.titleError
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : data.title && !data.titleError
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                          : 'focus:border-primary focus:ring-primary/20'
                      )}
                    />
                    {data.title && !data.titleError && (
                      <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {data.titleError && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                    )}
                  </div>
                  {data.titleError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {data.titleError}
                    </p>
                  )}
                </div>

                {/* Price Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor={`price-${index}`}
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <DollarSign className="h-3 w-3" />
                    Additional Price
                  </Label>
                  <div className="relative">
                    <Input
                      id={`price-${index}`}
                      type="text"
                      inputMode="decimal"
                      name="price"
                      placeholder="0.00"
                      value={data.price}
                      onChange={e => handleChange(index, e)}
                      className={cn(
                        'transition-all duration-200 pl-8',
                        data.priceError
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                          : data.price && !data.priceError
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                          : 'focus:border-primary focus:ring-primary/20'
                      )}
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {data.price && !data.priceError && (
                      <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {data.priceError && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                    )}
                  </div>
                  {data.priceError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {data.priceError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no additional cost
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
