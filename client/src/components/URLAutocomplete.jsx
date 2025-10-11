import { useState, useEffect, useRef } from 'react'
import { GlobeAltIcon } from '@heroicons/react/24/outline'

// Favicon component with error handling
function FaviconImage({ domain }) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const faviconUrl = `https://logo.clearbit.com/${domain}`

  return (
    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded overflow-hidden relative">
      {!hasError ? (
        <img
          src={faviconUrl}
          alt=""
          className="w-full h-full object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
          style={{ display: isLoading || hasError ? 'none' : 'block' }}
        />
      ) : null}
      {(hasError || isLoading) && (
        <GlobeAltIcon className="h-4 w-4 text-gray-400" />
      )}
    </div>
  )
}

export default function URLAutocomplete({ value, onChange, onBlur, error, placeholder = "example.com or https://example.com" }) {
  const [inputValue, setInputValue] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentDomains, setRecentDomains] = useState([])
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Load recent domains from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentDomains')
    if (stored) {
      try {
        setRecentDomains(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recent domains:', e)
      }
    }
  }, [])

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Extract domain from URL for favicon
  const extractDomain = (url) => {
    try {
      // Remove protocol if exists
      let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '')
      // Remove path and query params
      domain = domain.split('/')[0].split('?')[0]
      return domain
    } catch (e) {
      return url
    }
  }

  // Generate suggestions based on input
  const generateSuggestions = (input) => {
    if (!input || input.length < 2) {
      setSuggestions([])
      return
    }

    const suggestions = []
    const cleanInput = input.replace(/^https?:\/\//, '').replace(/^www\./, '')

    // Add variations of the input
    suggestions.push({
      domain: cleanInput,
      display: cleanInput,
      url: cleanInput
    })

    if (!cleanInput.startsWith('www.')) {
      suggestions.push({
        domain: cleanInput,
        display: `www.${cleanInput}`,
        url: `www.${cleanInput}`
      })
    }

    suggestions.push({
      domain: cleanInput,
      display: `https://${cleanInput}`,
      url: `https://${cleanInput}`
    })

    suggestions.push({
      domain: cleanInput,
      display: `https://www.${cleanInput}`,
      url: `https://www.${cleanInput}`
    })

    // Add recent domains that match
    const matchingRecent = recentDomains
      .filter(domain => domain.toLowerCase().includes(cleanInput.toLowerCase()))
      .slice(0, 3)
      .map(domain => ({
        domain: extractDomain(domain),
        display: domain,
        url: domain,
        isRecent: true
      }))

    setSuggestions([...matchingRecent, ...suggestions])
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    generateSuggestions(newValue)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex])
        } else if (inputValue) {
          // If no suggestion selected, just use the input value
          handleBlur()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  const selectSuggestion = (suggestion) => {
    const selectedUrl = suggestion.url
    setInputValue(selectedUrl)
    onChange(selectedUrl)
    setShowSuggestions(false)
    setSelectedIndex(-1)

    // Save to recent domains
    const domain = extractDomain(selectedUrl)
    const updated = [domain, ...recentDomains.filter(d => extractDomain(d) !== domain)].slice(0, 10)
    setRecentDomains(updated)
    localStorage.setItem('recentDomains', JSON.stringify(updated))
  }

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
      if (onBlur) onBlur()
    }, 200)
  }

  const handleFocus = () => {
    if (inputValue && inputValue.length >= 2) {
      generateSuggestions(inputValue)
      setShowSuggestions(true)
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [selectedIndex])

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`input mt-1 ${error ? 'border-red-500' : ''}`}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <GlobeAltIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-primary-50 border-l-2 border-primary-500'
                  : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                selectSuggestion(suggestion)
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {/* Favicon */}
              <FaviconImage domain={suggestion.domain} />

              {/* URL */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">
                  {suggestion.display}
                </div>
                {suggestion.isRecent && (
                  <div className="text-xs text-gray-500">Recent</div>
                )}
              </div>

              {/* Keyboard hint */}
              {index === selectedIndex && (
                <div className="flex-shrink-0 text-xs text-gray-400">
                  Press Enter
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500">
        You can enter a domain like "example.com" or full URL like "https://example.com"
      </p>
    </div>
  )
}

