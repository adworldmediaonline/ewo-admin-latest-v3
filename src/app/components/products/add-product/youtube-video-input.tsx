'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Youtube, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';

interface YouTubeVideoInputProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  defaultValue?: string;
}

const YouTubeVideoInput = ({
  register,
  errors,
  setValue,
  defaultValue,
}: YouTubeVideoInputProps) => {
  const [videoUrl, setVideoUrl] = useState(defaultValue || '');
  const [videoId, setVideoId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Extract YouTube video ID from various URL formats
  const extractVideoId = (url: string): string => {
    if (!url) return '';

    // If it's already just an ID (11 characters, alphanumeric with - and _)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    try {
      // Remove whitespace
      url = url.trim();

      // Pattern 1: https://www.youtube.com/watch?v=VIDEO_ID
      let match = url.match(/[?&]v=([^&]+)/);
      if (match) return match[1];

      // Pattern 2: https://youtu.be/VIDEO_ID
      match = url.match(/youtu\.be\/([^?]+)/);
      if (match) return match[1];

      // Pattern 3: https://www.youtube.com/embed/VIDEO_ID
      match = url.match(/\/embed\/([^?]+)/);
      if (match) return match[1];

      // Pattern 4: https://www.youtube.com/v/VIDEO_ID
      match = url.match(/\/v\/([^?]+)/);
      if (match) return match[1];

      return '';
    } catch {
      return '';
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    setUrlError('');

    if (!url) {
      setVideoId('');
      setValue('videoId', ''); // Update form value
      return;
    }

    const extractedId = extractVideoId(url);
    if (extractedId) {
      setVideoId(extractedId);
      setValue('videoId', extractedId); // Update form value
      setUrlError('');
    } else {
      setVideoId('');
      setValue('videoId', ''); // Update form value
      if (url.length > 5) {
        setUrlError('Invalid YouTube URL or Video ID');
      }
    }
  };

  // Clear input
  const handleClear = () => {
    setVideoUrl('');
    setVideoId('');
    setValue('videoId', ''); // Update form value
    setUrlError('');
    setShowPreview(false);
  };

  // Initialize with default value
  useEffect(() => {
    if (defaultValue) {
      const extractedId = extractVideoId(defaultValue);
      setVideoId(extractedId);
      setValue('videoId', extractedId); // Update form value
      if (extractedId) {
        setVideoUrl(defaultValue);
      }
    }
  }, [defaultValue, setValue]);

  const hasError = errors?.videoId;
  const hasVideo = videoId && !urlError;

  return (
    <div className="space-y-4">
      {/* Label and Instructions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="videoUrl"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Youtube className="h-4 w-4 text-red-600" />
            YouTube Video
          </Label>
          {hasVideo && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  Show Preview
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Paste a YouTube URL or video ID. Supports multiple formats:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
                https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
                https://youtu.be/dQw4w9WgXcQ
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
                dQw4w9WgXcQ
              </code>{' '}
              (video ID only)
            </span>
          </li>
        </ul>
      </div>

      {/* URL Input */}
      <div className="relative">
        <Input
          id="videoUrl"
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="Paste YouTube URL or video ID here..."
          className={`pr-10 transition-all duration-200 ${
            hasError || urlError
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : hasVideo
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
              : 'focus:border-primary focus:ring-primary/20'
          }`}
          aria-describedby={hasError || urlError ? 'video-error' : undefined}
          aria-invalid={!!(hasError || urlError)}
        />

        {/* Clear Button */}
        {videoUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear video URL"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hidden input for form submission - stores the video ID */}
      <input type="hidden" {...register('videoId')} value={videoId} />

      {/* Status Messages */}
      {urlError && (
        <div
          className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          role="alert"
          id="video-error"
        >
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Invalid URL</p>
            <p className="text-destructive/80 mt-0.5">{urlError}</p>
          </div>
        </div>
      )}

      {hasVideo && !urlError && (
        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
          <Youtube className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm flex-1">
            <p className="font-medium text-green-800 dark:text-green-300">
              Video Detected
            </p>
            <p className="text-green-700 dark:text-green-400 mt-0.5">
              Video ID:{' '}
              <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                {videoId}
              </code>
            </p>
          </div>
        </div>
      )}

      {hasError && (
        <div
          className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Validation Error</p>
            <p className="text-destructive/80 mt-0.5">
              {hasError.message as string}
            </p>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {showPreview && hasVideo && !urlError && (
        <div className="space-y-2 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Video Preview</p>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
          <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This is how the video will appear on your product page.
          </p>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideoInput;

