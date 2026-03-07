'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import type { ImageWithMeta } from '@/types/image-with-meta';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  GripVertical,
  Plus,
  Settings,
  Trash2,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ConfigurationOption {
  name: string;
  price: number | string;
  priceType?: 'fixed' | 'percentage';
  percentage?: number;
  isPercentageIncrease?: boolean;
  isSelected: boolean;
  /** @deprecated Use imageWithMeta.url for backward compat */
  image?: string;
  imageWithMeta?: ImageWithMeta | null;
  quantity?: number | null;
}

interface ConfigurationData {
  title: string;
  options: ConfigurationOption[];
  enableCustomNote?: boolean;
  customNotePlaceholder?: string;
}

type IPropType = {
  setConfigurations: React.Dispatch<
    SetStateAction<
      {
        title: string;
        options: {
          name: string;
          price: number | string;
          isSelected: boolean;
        }[];
      }[]
    >
  >;
  default_value?: ConfigurationData[];
  isSubmitted?: boolean;
};

// Enhanced ConfigurationData interface with validation
interface EnhancedConfigurationData extends ConfigurationData {
  isValid: boolean;
  hasError: boolean;
  titleError: string;
}

const OPTION_ID_PREFIX = 'config-opt-';

function SortableOptionCard({
  id,
  isSelected,
  children,
}: {
  id: string;
  isSelected: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 flex items-start gap-3',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary/20 z-10',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-muted bg-background hover:border-primary/30'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-1 flex shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder option"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      {children}
    </div>
  );
}

export default function ProductConfigurations({
  setConfigurations,
  default_value,
  isSubmitted,
}: IPropType) {
  // Track raw percentage input values to preserve decimals while typing
  const [percentageInputs, setPercentageInputs] = useState<{
    [key: string]: string;
  }>({});
  const [formData, setFormData] = useState<EnhancedConfigurationData[]>(
    default_value && default_value.length > 0
      ? default_value.map(item => ({
        ...item,
        isValid: true,
        hasError: false,
        titleError: '',
        enableCustomNote: item.enableCustomNote || false,
        customNotePlaceholder:
          item.customNotePlaceholder ||
          'Specify Rod Ends preference (All left, All right, mixed, or custom).',
        options: item.options.map(opt => {
          const imgMeta = opt.imageWithMeta ?? (opt.image ? { url: opt.image, fileName: '', title: '', altText: '' } : null);
          return {
            ...opt,
            price: typeof opt.price === 'number' ? opt.price : parseFloat(opt.price) || 0,
            priceType: opt.priceType || 'fixed',
            percentage: opt.percentage || 0,
            isPercentageIncrease: opt.isPercentageIncrease !== undefined ? opt.isPercentageIncrease : true,
            image: opt.image ?? imgMeta?.url ?? '',
            imageWithMeta: imgMeta,
            quantity: opt.quantity ?? null,
          };
        }),
      }))
      : []
  );
  const [hasDefaultValues, setHasDefaultValues] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOptionDragEnd = (configIndex: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const config = formData[configIndex];
    if (!config?.options?.length) return;
    const items = config.options.map((_, i) => `${OPTION_ID_PREFIX}${configIndex}-${i}`);
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    handleOptionReorder(configIndex, oldIndex, newIndex);
  };

  // Validation functions
  const validateTitle = (title: string): string => {
    if (!title.trim()) return 'Configuration title is required';
    if (title.trim().length < 2)
      return 'Title must be at least 2 characters';
    if (title.trim().length > 100)
      return 'Title must be less than 100 characters';
    return '';
  };

  const validateOptionName = (name: string, enableCustomNote?: boolean): string => {
    // Option name is optional when custom note is enabled
    if (enableCustomNote) return '';
    if (!name.trim()) return 'Option name is required';
    if (name.trim().length < 2)
      return 'Option name must be at least 2 characters';
    if (name.trim().length > 100)
      return 'Option name must be less than 100 characters';
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

  // Parse a price from any format to a valid number
  const parsePrice = (price: number | string): number => {
    if (price === '') return 0;
    if (typeof price === 'number') return price;

    const parsed = parseFloat(price.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  // Set default values when default_value loads (e.g. edit product) - sync both formData and parent state
  useEffect(() => {
    if (default_value && !hasDefaultValues && default_value.length > 0) {
      const processedValues = default_value.map(item => ({
        ...item,
        options: item.options.map(opt => ({
          ...opt,
          price: parsePrice(opt.price),
        })),
      }));

      const formDataFromDefaults = default_value.map(item => ({
        ...item,
        isValid: true,
        hasError: false,
        titleError: '',
        enableCustomNote: item.enableCustomNote || false,
        customNotePlaceholder:
          item.customNotePlaceholder ||
          'Specify Rod Ends preference (All left, All right, mixed, or custom).',
        options: item.options.map(opt => {
          const imgMeta = opt.imageWithMeta ?? (opt.image ? { url: opt.image, fileName: '', title: '', altText: '' } : null);
          return {
            ...opt,
            price: typeof opt.price === 'number' ? opt.price : parseFloat(String(opt.price)) || 0,
            priceType: opt.priceType || 'fixed',
            percentage: opt.percentage || 0,
            isPercentageIncrease: opt.isPercentageIncrease !== undefined ? opt.isPercentageIncrease : true,
            image: opt.image ?? imgMeta?.url ?? '',
            imageWithMeta: imgMeta,
            quantity: opt.quantity ?? null,
          };
        }),
      }));

      setFormData(formDataFromDefaults);
      setConfigurations(processedValues);
      setHasDefaultValues(true);
    }
  }, [default_value, hasDefaultValues, setConfigurations]);

  // Handle configuration title change
  const handleConfigurationTitleChange = (
    configIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[configIndex] = {
      ...updatedFormData[configIndex],
      title: value,
    };

    const titleError = validateTitle(value);
    updatedFormData[configIndex] = {
      ...updatedFormData[configIndex],
      titleError,
      hasError: !!titleError,
      isValid: !titleError,
    };

    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle option name change
  const handleOptionNameChange = (
    configIndex: number,
    optionIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[configIndex].options[optionIndex] = {
      ...updatedFormData[configIndex].options[optionIndex],
      name: value,
    };

    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle option quantity change
  const handleOptionQuantityChange = (
    configIndex: number,
    optionIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedFormData = [...formData];

    if (value === '') {
      updatedFormData[configIndex].options[optionIndex] = {
        ...updatedFormData[configIndex].options[optionIndex],
        quantity: null,
      };
    } else {
      const num = parseInt(value, 10);
      if (!Number.isNaN(num) && num >= 0) {
        updatedFormData[configIndex].options[optionIndex] = {
          ...updatedFormData[configIndex].options[optionIndex],
          quantity: num,
        };
      }
    }

    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle option price change
  const handleOptionPriceChange = (
    configIndex: number,
    optionIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedFormData = [...formData];

    // Allow empty string, numbers, and numbers with decimals only
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      updatedFormData[configIndex].options[optionIndex] = {
        ...updatedFormData[configIndex].options[optionIndex],
        price: value,
      };

      setFormData(updatedFormData);
      updateParentState(updatedFormData);
    }
  };

  // Handle option image change (ImageUploadWithMeta calls this)
  const handleOptionImageChange = (
    configIndex: number,
    optionIndex: number,
    value: ImageWithMeta | null
  ) => {
    const updatedFormData = [...formData];
    updatedFormData[configIndex].options[optionIndex] = {
      ...updatedFormData[configIndex].options[optionIndex],
      image: value?.url ?? '',
      imageWithMeta: value ?? undefined,
    };
    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle price type change
  const handlePriceTypeChange = (
    configIndex: number,
    optionIndex: number,
    priceType: 'fixed' | 'percentage'
  ) => {
    const updatedFormData = [...formData];
    updatedFormData[configIndex].options[optionIndex] = {
      ...updatedFormData[configIndex].options[optionIndex],
      priceType,
      // Reset percentage if switching to fixed
      percentage: priceType === 'fixed' ? 0 : updatedFormData[configIndex].options[optionIndex].percentage || 0,
    };
    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle percentage change
  const handlePercentageChange = (
    configIndex: number,
    optionIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const inputKey = `${configIndex}-${optionIndex}`;
    const updatedFormData = [...formData];

    // Update the raw input value for display
    setPercentageInputs(prev => ({
      ...prev,
      [inputKey]: value,
    }));

    // Allow empty string
    if (value === '') {
      updatedFormData[configIndex].options[optionIndex] = {
        ...updatedFormData[configIndex].options[optionIndex],
        percentage: 0,
      };
      setFormData(updatedFormData);
      updateParentState(updatedFormData);
      return;
    }

    // More permissive regex - allows decimals at any point
    // Matches: "15", "15.38", "15.", ".5", "0.5", "100", "100.0", etc.
    const decimalRegex = /^\d*\.?\d*$/;

    if (decimalRegex.test(value)) {
      // Parse the value (handles incomplete decimals like "15." as 15)
      const numValue = parseFloat(value);

      // If it's a valid number (or in the process of typing)
      if (!isNaN(numValue) || value.endsWith('.') || value === '.') {
        // For incomplete decimals (ending with "."), don't update the stored value yet
        // Just keep the raw input for display
        if (value.endsWith('.') || value === '.') {
          // Don't update the stored percentage value, just keep the input
          return;
        }

        // For complete values, validate range and update
        if (numValue >= 0 && numValue <= 100) {
          updatedFormData[configIndex].options[optionIndex] = {
            ...updatedFormData[configIndex].options[optionIndex],
            percentage: numValue,
          };
          setFormData(updatedFormData);
          updateParentState(updatedFormData);
          // Clear the raw input since we have a complete value stored
          setPercentageInputs(prev => {
            const newInputs = { ...prev };
            delete newInputs[inputKey];
            return newInputs;
          });
        }
      }
    }
  };

  // Handle percentage increase/decrease toggle
  const handlePercentageIncreaseToggle = (
    configIndex: number,
    optionIndex: number,
    isIncrease: boolean
  ) => {
    const updatedFormData = [...formData];
    updatedFormData[configIndex].options[optionIndex] = {
      ...updatedFormData[configIndex].options[optionIndex],
      isPercentageIncrease: isIncrease,
    };
    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle option selection (preselected)
  const handleOptionSelect = (configIndex: number, optionIndex: number) => {
    const updatedFormData = [...formData];
    const config = updatedFormData[configIndex];
    const option = config.options[optionIndex];

    // Only allow selection if the option has a name
    if (!option.name.trim()) {
      return;
    }

    // Unselect all options in this configuration
    config.options.forEach(opt => {
      opt.isSelected = false;
    });

    // Select the clicked option
    config.options[optionIndex].isSelected = true;

    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle custom note enable/disable
  const handleCustomNoteToggle = (configIndex: number, enabled: boolean) => {
    const updatedFormData = [...formData];
    updatedFormData[configIndex] = {
      ...updatedFormData[configIndex],
      enableCustomNote: enabled,
      customNotePlaceholder: enabled
        ? updatedFormData[configIndex].customNotePlaceholder ||
        'Specify Rod Ends preference (All left, All right, mixed, or custom).'
        : undefined,
    };
    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Handle custom note placeholder change
  const handleCustomNotePlaceholderChange = (
    configIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const updatedFormData = [...formData];
    updatedFormData[configIndex] = {
      ...updatedFormData[configIndex],
      customNotePlaceholder: value,
    };
    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Add new configuration
  const handleAddConfiguration = () => {
    const newConfiguration: EnhancedConfigurationData = {
      title: '',
      options: [
        {
          name: '',
          price: '',
          priceType: 'fixed',
          percentage: 0,
          isPercentageIncrease: true,
          isSelected: false, // Don't preselect empty options
          image: '',
          imageWithMeta: undefined,
          quantity: null,
        },
      ],
      isValid: true,
      hasError: false,
      titleError: '',
      enableCustomNote: false,
      customNotePlaceholder: 'Specify Rod Ends preference (All left, All right, mixed, or custom).',
    };

    setFormData([...formData, newConfiguration]);
    updateParentState([...formData, newConfiguration]);
  };

  // Remove configuration
  const handleRemoveConfiguration = (configIndex: number) => {
    const updatedFormData = [...formData];
    updatedFormData.splice(configIndex, 1);
    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Add option to configuration
  const handleAddOption = (configIndex: number) => {
    const updatedFormData = [...formData];
    const config = updatedFormData[configIndex];

    // Check if last option is valid
    const lastOption = config.options[config.options.length - 1];
    if (lastOption && lastOption.name.trim() !== '') {
      const newOption: ConfigurationOption = {
        name: '',
        price: '',
        priceType: 'fixed',
        percentage: 0,
        isPercentageIncrease: true,
        isSelected: false,
        image: '',
        imageWithMeta: undefined,
        quantity: null,
      };

      config.options.push(newOption);
      setFormData(updatedFormData);
      updateParentState(updatedFormData);
    }
  };

  // Remove option from configuration
  const handleRemoveOption = (configIndex: number, optionIndex: number) => {
    const updatedFormData = [...formData];
    const config = updatedFormData[configIndex];

    // Ensure at least one option remains
    if (config.options.length > 1) {
      const wasSelected = config.options[optionIndex].isSelected;
      config.options.splice(optionIndex, 1);

      // If the removed option was selected, select the first option that has a name
      if (wasSelected && config.options.length > 0) {
        const firstOptionWithName = config.options.find(opt => opt.name.trim());
        if (firstOptionWithName) {
          // Unselect all first
          config.options.forEach(opt => {
            opt.isSelected = false;
          });
          // Select the first option with a name
          firstOptionWithName.isSelected = true;
        }
      }

      setFormData(updatedFormData);
      updateParentState(updatedFormData);
    }
  };

  // Reorder options within a configuration (drag and drop)
  const handleOptionReorder = (configIndex: number, oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    const updatedFormData = [...formData];
    const config = updatedFormData[configIndex];
    if (!config?.options?.length) return;
    const reordered = arrayMove(config.options, oldIndex, newIndex);
    updatedFormData[configIndex] = {
      ...config,
      options: reordered,
    };
    setFormData(updatedFormData);
    updateParentState(updatedFormData);
  };

  // Update parent state with valid data
  const updateParentState = (data: EnhancedConfigurationData[]) => {
    const validDataForParent = data
      .filter(config => config.title.trim() !== '')
      .map(config => {
        // If custom note is enabled, options are not required
        let processedOptions: Array<{ name: string; price: number; isSelected: boolean; image?: string; imageWithMeta?: ImageWithMeta; quantity?: number | null }> = [];
        if (config.enableCustomNote) {
          // When custom note is enabled, we don't need options
          processedOptions = [];
        } else {
          // When custom note is disabled, filter and process options as before
          const validOptions = config.options.filter(opt => opt.name.trim() !== '');

          // Ensure only one option is selected per configuration
          // If multiple are selected, keep only the first one
          let hasSelected = false;
          processedOptions = validOptions.map(opt => {
            if (opt.isSelected && hasSelected) {
              // If we already have a selected option, unselect this one
              return {
                name: opt.name.trim(),
                price: parsePrice(opt.price),
                priceType: opt.priceType || 'fixed',
                percentage: opt.percentage || 0,
                isPercentageIncrease: opt.isPercentageIncrease !== undefined ? opt.isPercentageIncrease : true,
                isSelected: false,
                image: opt.image || opt.imageWithMeta?.url || '',
                imageWithMeta: opt.imageWithMeta ?? undefined,
                quantity: opt.quantity ?? null,
              };
            }
            if (opt.isSelected && !hasSelected) {
              hasSelected = true;
              return {
                name: opt.name.trim(),
                price: parsePrice(opt.price),
                priceType: opt.priceType || 'fixed',
                percentage: opt.percentage || 0,
                isPercentageIncrease: opt.isPercentageIncrease !== undefined ? opt.isPercentageIncrease : true,
                isSelected: true,
                image: opt.image || opt.imageWithMeta?.url || '',
                imageWithMeta: opt.imageWithMeta ?? undefined,
                quantity: opt.quantity ?? null,
              };
            }
            return {
              name: opt.name.trim(),
              price: parsePrice(opt.price),
              priceType: opt.priceType || 'fixed',
              percentage: opt.percentage || 0,
              isPercentageIncrease: opt.isPercentageIncrease !== undefined ? opt.isPercentageIncrease : true,
              isSelected: false,
              image: opt.image || opt.imageWithMeta?.url || '',
              imageWithMeta: opt.imageWithMeta ?? undefined,
              quantity: opt.quantity ?? null,
            };
          });
        }

        return {
          title: config.title.trim(),
          options: processedOptions,
          enableCustomNote: config.enableCustomNote || false,
          customNotePlaceholder: config.enableCustomNote
            ? config.customNotePlaceholder ||
            'Specify Rod Ends preference (All left, All right, mixed, or custom).'
            : undefined,
        };
      });

    setConfigurations(validDataForParent);
  };

  // Reset form when submitted
  useEffect(() => {
    if (isSubmitted) {
      setFormData([]);
      setHasDefaultValues(false);
    }
  }, [isSubmitted]);

  const validConfigurationsCount = formData.filter(
    config => config.title.trim() !== '' && !config.hasError
  ).length;
  const hasErrors = formData.some(config => config.hasError);

  return (
    <div className="space-y-6">
      {/* Configurations Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Settings className="h-3 w-3" />
            {validConfigurationsCount} configuration
            {validConfigurationsCount !== 1 ? 's' : ''}
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
          onClick={handleAddConfiguration}
          className="gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add Configuration
        </Button>
      </div>

      {/* Configurations List */}
      <div className="space-y-6">
        {formData.map((config, configIndex) => {
          const canRemoveConfig = formData.length > 0;

          return (
            <div
              key={configIndex}
              className={cn(
                'relative p-6 rounded-lg border transition-all duration-200',
                config.hasError
                  ? 'border-destructive/50 bg-destructive/5'
                  : config.isValid && config.title.trim()
                    ? 'border-green-500/50 bg-green-50/50'
                    : 'border-muted hover:border-primary/50'
              )}
            >
              {/* Configuration Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {configIndex + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Configuration {configIndex + 1}
                  </span>
                  {config.isValid && config.title.trim() && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {config.hasError && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>

                {canRemoveConfig && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveConfiguration(configIndex)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Configuration Title */}
              <div className="space-y-2 mb-6">
                <Label
                  htmlFor={`config-title-${configIndex}`}
                  className="text-sm font-medium flex items-center gap-1"
                >
                  Configuration Title
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={`config-title-${configIndex}`}
                    type="text"
                    placeholder="e.g. Bore Misalignment, Thread Direction"
                    value={config.title}
                    onChange={e => handleConfigurationTitleChange(configIndex, e)}
                    className={cn(
                      'transition-all duration-200',
                      config.titleError
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : config.title && !config.titleError
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                          : 'focus:border-primary focus:ring-primary/20'
                    )}
                  />
                  {config.title && !config.titleError && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {config.titleError && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                  )}
                </div>
                {config.titleError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {config.titleError}
                  </p>
                )}
              </div>

              {/* Options Section - Only show when custom note is disabled */}
              {!config.enableCustomNote && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Options ({config.options.length})
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddOption(configIndex)}
                      className="gap-1 h-8"
                      disabled={
                        config.options.length > 0 &&
                        config.options[config.options.length - 1].name.trim() ===
                        ''
                      }
                    >
                      <Plus className="h-3 w-3" />
                      Add Option
                    </Button>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleOptionDragEnd(configIndex, e)}
                  >
                    <SortableContext
                      items={config.options.map((_, i) => `${OPTION_ID_PREFIX}${configIndex}-${i}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {config.options.map((option, optionIndex) => {
                          const canRemoveOption = config.options.length > 1;

                          return (
                            <SortableOptionCard
                              key={optionIndex}
                              id={`${OPTION_ID_PREFIX}${configIndex}-${optionIndex}`}
                              isSelected={option.isSelected ?? false}
                            >
                              <Collapsible defaultOpen className="flex-1 min-w-0 group">
                                <div className="flex items-start gap-3">
                                  <CollapsibleTrigger asChild>
                                    <button
                                      type="button"
                                      className="flex flex-1 min-w-0 items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground -ml-1"
                                      aria-label="Toggle option details"
                                    >
                                      <ChevronRight className="h-4 w-4 shrink-0 group-data-[state=open]:hidden" />
                                      <ChevronDown className="h-4 w-4 shrink-0 hidden group-data-[state=open]:block" />
                                      <span className="truncate">
                                        {option.name.trim() || `Option ${optionIndex + 1}`}
                                      </span>
                                    </button>
                                  </CollapsibleTrigger>
                                  {/* Selection Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOptionSelect(configIndex, optionIndex)
                                    }
                                    disabled={!option.name.trim()}
                                    className={cn(
                                      'mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0',
                                      option.isSelected
                                        ? 'border-primary bg-primary'
                                        : option.name.trim()
                                          ? 'border-muted-foreground/30 hover:border-primary/50 cursor-pointer'
                                          : 'border-muted-foreground/20 opacity-50 cursor-not-allowed'
                                    )}
                                    aria-label={
                                      option.name.trim()
                                        ? `Select ${option.name}`
                                        : 'Option name required to select'
                                    }
                                  >
                                    {option.isSelected && (
                                      <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </button>

                                  {/* Remove Option Button - visible in header */}
                                  {canRemoveOption && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveOption(configIndex, optionIndex);
                                      }}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                <CollapsibleContent>
                                  <div className="mt-4 pt-4 border-t border-muted/50">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Option Name */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`option-name-${configIndex}-${optionIndex}`}
                                  className="text-xs font-medium"
                                >
                                  Option Name
                                  <span className="text-muted-foreground text-xs"> (Optional)</span>
                                </Label>
                                <Input
                                  id={`option-name-${configIndex}-${optionIndex}`}
                                  type="text"
                                  placeholder='e.g. 1"-3/4" STAINLESS STEEL'
                                  value={option.name}
                                  onChange={e =>
                                    handleOptionNameChange(
                                      configIndex,
                                      optionIndex,
                                      e
                                    )
                                  }
                                  className="text-sm"
                                />
                              </div>

                              {/* Quantity (Optional) */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`option-quantity-${configIndex}-${optionIndex}`}
                                  className="text-xs font-medium"
                                >
                                  Quantity (Optional)
                                </Label>
                                <Input
                                  id={`option-quantity-${configIndex}-${optionIndex}`}
                                  type="number"
                                  min={0}
                                  placeholder="Uses product quantity if empty"
                                  value={option.quantity ?? ''}
                                  onChange={e =>
                                    handleOptionQuantityChange(
                                      configIndex,
                                      optionIndex,
                                      e
                                    )
                                  }
                                  className="text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Per-option stock. Leave empty to use main product quantity.
                                </p>
                              </div>

                              {/* Price Type Selection */}
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs font-medium">
                                  Price Type
                                </Label>
                                <Select
                                  value={option.priceType || 'fixed'}
                                  onValueChange={(value: 'fixed' | 'percentage') =>
                                    handlePriceTypeChange(configIndex, optionIndex, value)
                                  }
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select price type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fixed">Fixed Price</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Fixed Price (shown when priceType is 'fixed') */}
                              {(option.priceType || 'fixed') === 'fixed' && (
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`option-price-${configIndex}-${optionIndex}`}
                                    className="text-xs font-medium flex items-center gap-1"
                                  >
                                    <DollarSign className="h-3 w-3" />
                                    Fixed Price
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      id={`option-price-${configIndex}-${optionIndex}`}
                                      type="text"
                                      inputMode="decimal"
                                      placeholder="0.00"
                                      value={option.price}
                                      onChange={e =>
                                        handleOptionPriceChange(
                                          configIndex,
                                          optionIndex,
                                          e
                                        )
                                      }
                                      className="text-sm pl-8"
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Default: $0.00
                                  </p>
                                </div>
                              )}

                              {/* Percentage (shown when priceType is 'percentage') */}
                              {(option.priceType || 'fixed') === 'percentage' && (
                                <>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`option-percentage-${configIndex}-${optionIndex}`}
                                      className="text-xs font-medium"
                                    >
                                      Percentage (%)
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        id={`option-percentage-${configIndex}-${optionIndex}`}
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={
                                          (() => {
                                            const inputKey = `${configIndex}-${optionIndex}`;
                                            // Use raw input if available (for typing decimals), otherwise use stored value
                                            if (percentageInputs[inputKey] !== undefined) {
                                              return percentageInputs[inputKey];
                                            }
                                            return option.percentage !== undefined && option.percentage !== null
                                              ? option.percentage.toString()
                                              : '';
                                          })()
                                        }
                                        onChange={e =>
                                          handlePercentageChange(
                                            configIndex,
                                            optionIndex,
                                            e
                                          )
                                        }
                                        className="text-sm pr-8"
                                      />
                                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                                        %
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Range: 0-100% (decimals allowed, e.g., 15.38)
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-medium">
                                      Price Adjustment
                                    </Label>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant={option.isPercentageIncrease !== false ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() =>
                                          handlePercentageIncreaseToggle(
                                            configIndex,
                                            optionIndex,
                                            true
                                          )
                                        }
                                        className="flex-1"
                                      >
                                        Increase
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={option.isPercentageIncrease === false ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() =>
                                          handlePercentageIncreaseToggle(
                                            configIndex,
                                            optionIndex,
                                            false
                                          )
                                        }
                                        className="flex-1"
                                      >
                                        Decrease
                                      </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {option.isPercentageIncrease !== false ? 'Price will increase' : 'Price will decrease'} by {option.percentage || 0}%
                                    </p>
                                  </div>
                                </>
                              )}

                              {/* Option Image Upload */}
                              <div className="space-y-2 md:col-span-2">
                                <Label
                                  htmlFor={`option-image-${configIndex}-${optionIndex}`}
                                  className="text-xs font-medium flex items-center gap-1"
                                >
                                  <ImageIcon className="h-3 w-3" />
                                  Option Image (Optional)
                                </Label>
                                <ImageUploadWithMeta
                                  value={option.imageWithMeta ?? (option.image ? { url: option.image, fileName: '', title: '', altText: '' } : null)}
                                  onChange={(value) =>
                                    handleOptionImageChange(configIndex, optionIndex, value)
                                  }
                                  folder="ewo-assets/products"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Image will replace main product image when this option is selected. Supports filename, title, and alt text.
                                </p>
                              </div>
                            </div>
                                  </div>

                                  {/* Selected Badge */}
                                  {option.isSelected && (
                                    <div className="mt-3 pt-3 border-t border-primary/20">
                                      <Badge
                                        variant="default"
                                        className="gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                                      >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Preselected Option
                                      </Badge>
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </Collapsible>
                            </SortableOptionCard>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Custom Note Section */}
              <div className="space-y-3 mt-6 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`enable-custom-note-${configIndex}`}
                    checked={config.enableCustomNote || false}
                    onCheckedChange={(checked) =>
                      handleCustomNoteToggle(configIndex, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`enable-custom-note-${configIndex}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Enable Custom Note Field
                  </Label>
                </div>
                {config.enableCustomNote && (
                  <div className="space-y-2">
                    <Label
                      htmlFor={`custom-note-placeholder-${configIndex}`}
                      className="text-sm font-medium"
                    >
                      Placeholder Text
                    </Label>
                    <Input
                      id={`custom-note-placeholder-${configIndex}`}
                      type="text"
                      placeholder="Specify Rod Ends preference (All left, All right, mixed, or custom)."
                      value={config.customNotePlaceholder || ''}
                      onChange={(e) =>
                        handleCustomNotePlaceholderChange(configIndex, e)
                      }
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      This text will appear as a placeholder in the textarea on
                      the frontend.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {formData.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Configurations Added
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add product configurations to allow customers to customize their
            purchase.
          </p>
          <Button
            type="button"
            onClick={handleAddConfiguration}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Configuration
          </Button>
        </div>
      )}
    </div>
  );
}

