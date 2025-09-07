import { SmClose } from '@/svg';
import { useState, ChangeEvent, SetStateAction, useEffect } from 'react';

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

export default function ProductOptions({
  setOptions,
  default_value,
  isSubmitted,
}: IPropType) {
  const [formData, setFormData] = useState<OptionData[]>(
    default_value && default_value.length > 0
      ? default_value
      : [{ title: '', price: '' }]
  );
  const [hasDefaultValues, setHasDefaultValues] = useState<boolean>(false);

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

  // handle change field
  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = [...formData];

    // For price input, validate that it's a valid number format
    if (name === 'price') {
      // Allow empty string, numbers, and numbers with decimals only
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        updatedFormData[index] = {
          ...updatedFormData[index],
          [name]: value,
        };
      }
    } else {
      updatedFormData[index] = {
        ...updatedFormData[index],
        [name]: value,
      };
    }

    setFormData(updatedFormData);

    // Convert price to number when sending to parent
    const dataForParent = updatedFormData.map(item => ({
      title: item.title,
      price: parsePrice(item.price),
    }));

    setOptions(dataForParent);
  };

  // handle add field
  const handleAddField = () => {
    // Safety check to ensure formData is not empty
    if (formData.length === 0) {
      const newData = [{ title: '', price: '' }];
      setFormData(newData);
      setOptions([]);
      return;
    }

    const lastField = formData[formData.length - 1];
    if (lastField && lastField.title.trim() !== '') {
      setFormData([...formData, { title: '', price: '' }]);

      // Convert price to number when sending to parent
      const dataForParent = [...formData].map(item => ({
        title: item.title,
        price: parsePrice(item.price),
      }));

      setOptions(dataForParent);
    }
  };

  // handleRemoveField
  const handleRemoveField = (index: number) => {
    const updatedFormData = [...formData];
    updatedFormData.splice(index, 1);

    // Ensure there's always at least one form field
    if (updatedFormData.length === 0) {
      updatedFormData.push({ title: '', price: '' });
    }

    setFormData(updatedFormData);

    // Convert price to number when sending to parent
    const dataForParent = updatedFormData.map(item => ({
      title: item.title,
      price: parsePrice(item.price),
    }));

    setOptions(dataForParent);
  };

  // Reset form when isSubmitted changes
  useEffect(() => {
    if (isSubmitted) {
      setFormData([{ title: '', price: '' }]);
    }
  }, [isSubmitted]);

  return (
    <>
      <div className="px-8 py-8 mb-6 bg-white rounded-md">
        <h4 className="text-[22px]">Product Options</h4>
        <p className="mb-5 text-base text-gray-500">
          Add options for this product (e.g. Size, Color, Material). Options are
          optional.
        </p>
        <div>
          {formData.map((data, index) => {
            return (
              <div
                key={index}
                className={`grid grid-cols-12 gap-x-6 relative mb-6 last:mb-0`}
              >
                <div className="col-span-5">
                  <p className="mb-0 text-base text-black">
                    Option Title
                    {formData.length > 0 && <span className="text-red">*</span>}
                  </p>
                  <input
                    className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base"
                    type="text"
                    name="title"
                    placeholder="Enter option title (e.g. Small, Medium, Large)"
                    value={data.title}
                    onChange={e => handleChange(index, e)}
                  />
                </div>

                <div className="col-span-5">
                  <p className="mb-0 text-base text-black">
                    Option Price
                    {formData.length > 0 && <span className="text-red">*</span>}
                  </p>
                  <input
                    className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base"
                    type="text"
                    inputMode="decimal"
                    name="price"
                    placeholder="Enter option price (e.g. 3.99)"
                    value={data.price}
                    onChange={e => handleChange(index, e)}
                  />
                </div>

                <div className="col-span-2">
                  <p className="mb-0 text-base text-black">Remove</p>
                  <button
                    className="h-[44px] w-[44px] rounded-md border border-gray6 hover:border-red"
                    type="button"
                    onClick={() => handleRemoveField(index)}
                  >
                    <SmClose />
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between mt-8">
            <button
              className="px-5 py-2 tp-btn"
              type="button"
              onClick={handleAddField}
            >
              Add Option
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
