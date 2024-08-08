import  { useCallback, useState, useRef, useEffect } from 'react';

interface TagInputProps {
    tags: string;
    onTagsChange: (value: string) => void;
    tagCounts: { tagName: string; count: number }[];
}

export function TagInput({ tags, onTagsChange, tagCounts }: TagInputProps) {
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<(HTMLButtonElement | null)[]>([]);


    const generateTagSuggestions = useCallback((input: string) => {
        if (!input.trim()) {
            setSuggestedTags([]);
            return;
        }
        const inputTags = input.split(' ').filter(tag => tag.trim() !== '');
        const lastTag = inputTags[inputTags.length - 1].toLowerCase().replace(/^#/, '');
        
        if (!lastTag) {
            setSuggestedTags([]);
            return;
        }

        const suggestions = tagCounts
            .filter(tag => tag.tagName.toLowerCase().includes(lastTag))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(tag => `${tag.tagName}（${tag.count}）`);
        setSuggestedTags(suggestions);
    }, [tagCounts]);

    const handleTagsChange = useCallback((value: string) => {
        onTagsChange(value);
        generateTagSuggestions(value);
        setFocusedSuggestionIndex(-1);
    }, [onTagsChange, generateTagSuggestions]);

    const handleTagSuggestionClick = useCallback((suggestion: string) => {
        const tagArray = tags.split(' ').filter(tag => tag !== '');
        tagArray.pop();
        const newTag = suggestion.split('（')[0];
        const newTags = `${[...tagArray, `#${newTag}`].join(' ')} `;
        onTagsChange(newTags);
        setSuggestedTags([]);
        setFocusedSuggestionIndex(-1);
        inputRef.current?.focus();
    }, [tags, onTagsChange]);

    useEffect(() => {
        if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < suggestedTags.length) {
            suggestionsRef.current[focusedSuggestionIndex]?.focus();
        }
    }, [focusedSuggestionIndex, suggestedTags.length]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLButtonElement>) => {
        if (e.key === 'ArrowDown' && suggestedTags.length > 0) {
            e.preventDefault();
            setFocusedSuggestionIndex((prev) => (prev + 1) % suggestedTags.length);
        } else if (e.key === 'ArrowUp' && suggestedTags.length > 0) {
            e.preventDefault();
            setFocusedSuggestionIndex((prev) => (prev - 1 + suggestedTags.length) % suggestedTags.length);
        } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
            e.preventDefault();
            handleTagSuggestionClick(suggestedTags[focusedSuggestionIndex]);
        } else if (e.key === 'Escape') {
            setSuggestedTags([]);
            setFocusedSuggestionIndex(-1);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="relative">
            <textarea
                ref={inputRef}
                id="tags-input"
                name="tags"
                placeholder="タグを入力  #生活 #人生"
                className="textarea textarea-bordered w-full my-4 placeholer-slate-500"
                value={tags}
                onChange={(e) => handleTagsChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {suggestedTags.length > 0 && (
                <div className="absolute z-10 w-full bg-base-100 shadow-lg rounded-md mt-1">
                    {suggestedTags.map((suggestion, index) => (
                        <button
                            key={suggestion}
                            ref={el => { suggestionsRef.current[index] = el }}
                            tabIndex={0}
                            type="button"
                            className={`w-full text-left p-2 hover:bg-base-200 focus:bg-base-300 outline-none ${
                                index === focusedSuggestionIndex ? 'bg-base-300' : ''
                            }`}
                            onClick={() => handleTagSuggestionClick(suggestion)}
                            onKeyDown={handleKeyDown}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}