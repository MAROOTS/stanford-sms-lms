package com.stanford.schoolbackend.sms.library;

import com.stanford.schoolbackend.core.enums.NotificationType;
import com.stanford.schoolbackend.core.exception.ResourceNotFoundException;
import com.stanford.schoolbackend.core.notification.NotificationService;
import com.stanford.schoolbackend.core.user.User;
import com.stanford.schoolbackend.core.user.UserRepository;
import com.stanford.schoolbackend.sms.library.dto.BookHoldResponse;
import com.stanford.schoolbackend.sms.library.dto.PlaceHoldRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookHoldService {

    private final BookHoldRepository bookHoldRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookHoldResponse placeHold(Long bookId, PlaceHoldRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        User borrower = userRepository.findById(request.getBorrowerId())
                .orElseThrow(() -> new ResourceNotFoundException("Borrower not found"));

        BookHold hold = BookHold.builder().book(book).borrower(borrower).build();
        return toResponse(bookHoldRepository.save(hold));
    }

    public void cancelHold(Long holdId) {
        BookHold hold = bookHoldRepository.findById(holdId)
                .orElseThrow(() -> new ResourceNotFoundException("Hold not found"));
        bookHoldRepository.delete(hold);
    }

    public List<BookHoldResponse> listForBook(Long bookId) {
        return bookHoldRepository.findByBookIdAndFulfilledFalseOrderByRequestedAtAsc(bookId).stream()
                .map(this::toResponse)
                .toList();
    }

    void notifyNextInQueue(Book book) {
        bookHoldRepository.findFirstByBookIdAndFulfilledFalseAndNotifiedFalseOrderByRequestedAtAsc(book.getId())
                .ifPresent(hold -> {
                    notificationService.notifyUser(hold.getBorrower(), NotificationType.BOOK_HOLD_AVAILABLE,
                            "\"" + book.getTitle() + "\" is now available — visit the library to check it out.",
                            "/library");
                    hold.setNotified(true);
                    bookHoldRepository.save(hold);
                });
    }

    void fulfillMatchingHold(Book book, User borrower) {
        bookHoldRepository.findByBookIdAndBorrowerIdAndFulfilledFalse(book.getId(), borrower.getId())
                .ifPresent(hold -> {
                    hold.setFulfilled(true);
                    bookHoldRepository.save(hold);
                });
    }

    private BookHoldResponse toResponse(BookHold h) {
        return BookHoldResponse.builder()
                .id(h.getId())
                .bookId(h.getBook().getId())
                .bookTitle(h.getBook().getTitle())
                .borrowerId(h.getBorrower().getId())
                .borrowerName(h.getBorrower().getFirstName() + " " + h.getBorrower().getLastName())
                .requestedAt(h.getRequestedAt())
                .notified(h.isNotified())
                .fulfilled(h.isFulfilled())
                .build();
    }
}