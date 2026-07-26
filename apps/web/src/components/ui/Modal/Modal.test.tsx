import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onCloseMock = vi.fn();
    render(
      <Modal isOpen={true} onClose={onCloseMock}>
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking on overlay, but NOT when clicking inside content', () => {
    const onCloseMock = vi.fn();
    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Test Modal">
        <div data-testid="modal-child">Inside Content</div>
      </Modal>
    );

    const insideContent = screen.getByTestId('modal-child');
    fireEvent.click(insideContent);
    expect(onCloseMock).not.toHaveBeenCalled();

    const overlay = screen.getByText('Inside Content').closest(`div[class*="backdrop"]`);
    if (overlay) {
      fireEvent.click(overlay);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    } else {
      // Fallback if class selector differs
      const backdrop = screen.getByText('Test Modal').parentElement?.parentElement?.parentElement;
      fireEvent.click(backdrop!);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    }
  });
});
