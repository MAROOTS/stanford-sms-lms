package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.enums.CopyStatus;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.sms.library.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookLoanRepository bookLoanRepository;

    public BookResponse create(BookRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .publisher(request.getPublisher())
                .build();
        return toResponse(bookRepository.save(book));
    }

    public BookResponse update(Long id, BookRequest request) {
        Book book = getOrThrow(id);
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        return toResponse(bookRepository.save(book));
    }

    public void delete(Long id) {
        Book book = getOrThrow(id);
        boolean hasCopiesOut = bookCopyRepository.findByBookId(id).stream()
                .anyMatch(c -> c.getStatus() == CopyStatus.BORROWED);
        if (hasCopiesOut) {
            throw new IllegalArgumentException("Cannot delete a book with copies currently on loan");
        }
        bookRepository.delete(book);
    }

    public BookResponse getById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public List<BookResponse> listAll() {
        return bookRepository.findAll().stream().map(this::toResponse).toList();
    }

    public BookCopyResponse addCopy(Long bookId, AddCopyRequest request) {
        Book book = getOrThrow(bookId);
        BookCopy copy = BookCopy.builder().book(book).copyCode(request.getCopyCode()).build();
        return toCopyResponse(bookCopyRepository.save(copy));
    }

    public void deleteCopy(Long copyId) {
        BookCopy copy = getCopyOrThrow(copyId);
        if (copy.getStatus() == CopyStatus.BORROWED) {
            throw new IllegalArgumentException("Cannot delete a copy that is currently on loan");
        }
        bookCopyRepository.delete(copy);
    }

    public BookCopyResponse updateCopyStatus(Long copyId, UpdateCopyStatusRequest request) {
        BookCopy copy = getCopyOrThrow(copyId);

        if (request.getStatus() == CopyStatus.BORROWED) {
            throw new IllegalArgumentException("Copies can only become BORROWED by issuing a loan");
        }

        // If the copy is currently out and gets marked LOST/DAMAGED, close out its active loan too
        if (copy.getStatus() == CopyStatus.BORROWED
                && (request.getStatus() == CopyStatus.LOST || request.getStatus() == CopyStatus.DAMAGED)) {
            bookLoanRepository.findByReturnedDateIsNull().stream()
                    .filter(l -> l.getBookCopy().getId().equals(copyId))
                    .findFirst()
                    .ifPresent(loan -> {
                        loan.setReturnedDate(java.time.LocalDate.now());
                        bookLoanRepository.save(loan);
                    });
        }

        copy.setStatus(request.getStatus());
        return toCopyResponse(bookCopyRepository.save(copy));
    }

    public List<BookCopyResponse> listCopies(Long bookId) {
        return bookCopyRepository.findByBookId(bookId).stream().map(this::toCopyResponse).toList();
    }

    private Book getOrThrow(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
    }

    private BookCopy getCopyOrThrow(Long copyId) {
        return bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found"));
    }

    private BookResponse toResponse(Book book) {
        List<BookCopy> copies = bookCopyRepository.findByBookId(book.getId());
        long available = copies.stream().filter(c -> c.getStatus() == CopyStatus.AVAILABLE).count();

        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .publisher(book.getPublisher())
                .totalCopies(copies.size())
                .availableCopies((int) available)
                .build();
    }

    private BookCopyResponse toCopyResponse(BookCopy copy) {
        return BookCopyResponse.builder()
                .id(copy.getId())
                .bookId(copy.getBook().getId())
                .copyCode(copy.getCopyCode())
                .status(copy.getStatus())
                .build();
    }
}

//Marking a borrowed copy LOST/DAMAGED auto-closes its open loan (sets returnedDate to today)
//otherwise you'd end up with a permanently "still borrowed" loan for a book that's never coming back,
// which would silently corrupt overdue tracking.