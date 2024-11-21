/*
 * yielding.rs
 * this file is used only for testing purposes. to fix coverage issue
 * on await function, we need to have yield after the await statement
 *
 * References:
 *   https://github.com/rust-lang/rust/issues/98712
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::future::Future;

#[derive(Debug, Default)]
struct Yield {
    init: bool,
}

impl std::future::Future for Yield {
    type Output = ();

    fn poll(
        mut self: std::pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>
    ) -> std::task::Poll<Self::Output> {
        if !self.init {
            self.init = true;
            cx.waker().wake_by_ref();
            return std::task::Poll::Pending;
        } else {
            return std::task::Poll::Ready(());
        }
    }
}

pub trait FixCoverage {
    // This method returns a type that implements Future
    fn fix_cov(self) -> impl Future<Output = <Self as Future>::Output>
        where Self: Sized, Self: Future
    {
        // Use an async block inside to handle the asynchronous operations
        async move {
            let r = self.await;
            Yield::default().await; // Assuming Yield is a future
            r
        }
    }
}

impl<F, T> FixCoverage for F where F: Future<Output = T> {}
