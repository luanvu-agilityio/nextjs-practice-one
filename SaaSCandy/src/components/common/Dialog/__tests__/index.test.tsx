import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../index';

describe('Dialog Components', () => {
  it('renders Dialog with content correctly', () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Body</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(container).toMatchSnapshot();
  });

  it('displays title and description', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onOpenChange when close button clicked', () => {
    const mockOnOpenChange = jest.fn();

    render(
      <Dialog open={true} onOpenChange={mockOnOpenChange}>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalled();
  });
  it('applies custom className to DialogContent', () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent className='custom-class'>Test</DialogContent>
      </Dialog>
    );
    expect(
      container.firstChild.querySelector('.custom-class')
    ).toBeInTheDocument();
  });

  it('forwards ref to DialogContent', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Dialog open={true}>
        <DialogContent ref={ref}>Test</DialogContent>
      </Dialog>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders DialogClose', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('renders DialogPortal', () => {
    const { container } = render(
      <DialogPortal>
        <div data-testid='portal-content'>Portal</div>
      </DialogPortal>
    );
    expect(
      container.querySelector('[data-testid="portal-content"]')
    ).toBeInTheDocument();
  });

  it('renders DialogTrigger', () => {
    const { getByText } = render(
      <Dialog>
        <DialogTrigger>Trigger</DialogTrigger>
      </Dialog>
    );
    expect(getByText('Trigger')).toBeInTheDocument();
  });
});
