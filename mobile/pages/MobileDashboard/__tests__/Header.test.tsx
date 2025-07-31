import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

describe('Header', () => {
  describe('Basic Rendering', () => {
    it('renders with title only', () => {
      render(<Header title="Test Title" />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title');
    });

    it('renders with title and subtitle', () => {
      render(<Header title="Main Title" subtitle="Test subtitle" />);
      
      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
      const { container } = render(<Header title="Test" subtitle="Subtitle" />);
      
      const headerContainer = container.firstChild;
      expect(headerContainer).toHaveClass('flex', 'items-center', 'justify-between', 'mb-4', 'mt-2', 'px-4');
      
      const titleElement = screen.getByRole('heading', { level: 2 });
      expect(titleElement).toHaveClass('text-lg', 'font-bold', 'text-gray-800', 'dark:text-gray-200');
      
      const subtitleElement = screen.getByText('Subtitle');
      expect(subtitleElement).toHaveClass('text-sm', 'text-gray-500', 'dark:text-gray-400');
    });
  });

  describe('Props Handling', () => {
    it('renders only title when subtitle is not provided', () => {
      render(<Header title="Only Title" />);
      
      expect(screen.getByText('Only Title')).toBeInTheDocument();
      expect(screen.queryByText('subtitle')).not.toBeInTheDocument();
    });

    it('renders only title when subtitle is empty string', () => {
      render(<Header title="Title" subtitle="" />);
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      // Don't try to query for empty string as it may be normalized by React
      const titleElement = screen.getByRole('heading', { level: 2 });
      expect(titleElement).toHaveTextContent('Title');
    });

    it('renders only title when subtitle is undefined', () => {
      render(<Header title="Title" subtitle={undefined} />);
      
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Text Content', () => {
    it('handles special characters in title', () => {
      const specialTitle = "Title with & symbols!";
      render(<Header title={specialTitle} />);
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('handles special characters in subtitle', () => {
      const specialSubtitle = "Subtitle with & symbols!";
      render(<Header title="Title" subtitle={specialSubtitle} />);
      
      expect(screen.getByText(specialSubtitle)).toBeInTheDocument();
    });

    it('handles long title text', () => {
      const longTitle = "This is a very long title that might wrap to multiple lines in some layouts";
      render(<Header title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles long subtitle text', () => {
      const longSubtitle = "This is a very long subtitle that might wrap to multiple lines in some layouts";
      render(<Header title="Title" subtitle={longSubtitle} />);
      
      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses proper heading hierarchy', () => {
      render(<Header title="Accessible Title" subtitle="Accessible subtitle" />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Accessible Title');
    });

    it('maintains semantic structure', () => {
      const { container } = render(<Header title="Title" subtitle="Subtitle" />);
      
      // Check that the structure is semantically correct
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-between');
      
      const contentContainer = mainContainer.firstChild;
      expect(contentContainer).toHaveClass('flex-1');
      
      const heading = screen.getByRole('heading');
      const paragraph = screen.getByText('Subtitle');
      
      expect(heading.tagName).toBe('H2');
      expect(paragraph.tagName).toBe('P');
    });
  });

  describe('Layout Structure', () => {
    it('maintains proper layout with title only', () => {
      const { container } = render(<Header title="Title" />);
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-between');
      
      const contentContainer = mainContainer.firstChild;
      expect(contentContainer).toHaveClass('flex-1');
    });

    it('maintains proper layout with title and subtitle', () => {
      const { container } = render(<Header title="Title" subtitle="Subtitle" />);
      
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-between');
      
      const contentContainer = mainContainer.firstChild;
      expect(contentContainer).toHaveClass('flex-1');
      
      // Both title and subtitle should be within the flex-1 container
      expect(contentContainer).toContainElement(screen.getByText('Title'));
      expect(contentContainer).toContainElement(screen.getByText('Subtitle'));
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      render(<Header title="" />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('');
    });

    it('handles numeric title', () => {
      render(<Header title="123" />);
      
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('handles numeric subtitle', () => {
      render(<Header title="Title" subtitle="456" />);
      
      expect(screen.getByText('456')).toBeInTheDocument();
    });
  });

  describe('Theme Classes', () => {
    it('applies light and dark theme classes for title', () => {
      render(<Header title="Theme Test" />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-gray-800', 'dark:text-gray-200');
    });

    it('applies light and dark theme classes for subtitle', () => {
      render(<Header title="Title" subtitle="Theme Test" />);
      
      const subtitle = screen.getByText('Theme Test');
      expect(subtitle).toHaveClass('text-gray-500', 'dark:text-gray-400');
    });
  });
}); 